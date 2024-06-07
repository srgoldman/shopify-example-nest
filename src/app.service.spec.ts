import * as nock from 'nock'
import { AppService } from './app.service'
import { Test, TestingModule } from '@nestjs/testing'

nock.back.fixtures = __dirname + '/__nocks__'
nock.back.setMode('update')

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = module.get<AppService>(AppService)
  })
  describe('shopify storefront api', () => {
    it('should record/replay the storefront query', async () => {
      await nock.back('shop-query.json').then(async ({ nockDone }) => {
        const expectedShopResponse = {
          name: 'wearfigs-sandbox',
          id: 'gid://shopify/Shop/38190448773',
        }
        const shop = await service.shopQuery()
        expect(shop).toEqual(expectedShopResponse)
        nockDone()
      })
    })
  })
})
