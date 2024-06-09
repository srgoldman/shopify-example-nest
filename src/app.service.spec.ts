import * as nock from 'nock'
import { AppService, shopQuery } from './app.service'
import { Test, TestingModule } from '@nestjs/testing'
import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { fsReadFile } from 'ts-loader/dist/utils'

const expectedShopResponse = {
  name: 'wearfigs-sandbox',
  id: 'gid://shopify/Shop/38190448773',
}

describe('NockBack tests', () => {
  beforeAll(() => {
    nock.back.fixtures = __dirname + '/__nocks__'
    nock.back.setMode('update')
  })
  afterAll(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('AppService', () => {
    let service: AppService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AppService],
      }).compile()

      service = module.get<AppService>(AppService)
    })
    describe('shopify storefront api', () => {
      // This test is throwing an invalid protocol error

      it('should record/replay the storefront query', async () => {
        await nock.back('shop-query-nest.json').then(async ({ nockDone }) => {
          const shop = await service.shopQuery()
          expect(shop).toEqual(expectedShopResponse)
          nockDone()
          const savedResult = JSON.parse(fsReadFile(__dirname + '/__nocks__/shop-query-nest.json'))
          expect(savedResult).toEqual(expectedShopResponse)
        })
      })
    })
  })

  describe('direct shopify storefront api', () => {
    // This test makes the network call but records an empty array as the result

    it('should record/replay the storefront query', async () => {
      await nock.back('shop-query-node.json').then(async ({ nockDone }) => {
        const storefrontClient = createStorefrontApiClient({
          storeDomain: 'wearfigs-sandbox.myshopify.com',
          apiVersion: '2024-04',
          publicAccessToken: 'b8fbdce1d80fdffb0f15e027f5c11cd3',
        })
        const { data, errors, extensions } = await storefrontClient.request(shopQuery)
        console.debug(data, errors, extensions)
        expect(data['shop']).toEqual(expectedShopResponse)
        nockDone()
        const savedResult = JSON.parse(fsReadFile(__dirname + '/__nocks__/shop-query-node.json'))
        expect(savedResult).toEqual(expectedShopResponse)
      })
    })
  })
})

describe('using nock directly', () => {
  it('should display the calls', async () => {
    nock.recorder.clear()
    nock.recorder.rec()
    const storefrontClient = createStorefrontApiClient({
      storeDomain: 'wearfigs-sandbox.myshopify.com',
      apiVersion: '2024-04',
      publicAccessToken: 'b8fbdce1d80fdffb0f15e027f5c11cd3',
    })
    const { data, errors, extensions } = await storefrontClient.request(shopQuery)
    console.debug(data, errors, extensions)
    expect(data['shop']).toEqual(expectedShopResponse)
    const nockCalls = nock.recorder.play()
    console.debug(nockCalls)
    nock.recorder.clear()
    expect(nockCalls.length).toBeGreaterThan(0)
  })
})
