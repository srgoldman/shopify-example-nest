import { Injectable } from '@nestjs/common'
import { createStorefrontApiClient, StorefrontApiClient } from '@shopify/storefront-api-client'

export const shopQuery = `
    query {
      shop {
        name
        id
      }
    }`

@Injectable()
export class AppService {
  private readonly storefrontClient: StorefrontApiClient

  constructor() {
    this.storefrontClient = createStorefrontApiClient({
      storeDomain: 'wearfigs-sandbox.myshopify.com',
      apiVersion: '2024-04',
      publicAccessToken: 'b8fbdce1d80fdffb0f15e027f5c11cd3',
    })
  }

  getHello(): string {
    return 'Hello World!'
  }

  async shopQuery() {
    const { data, errors, extensions } = await this.storefrontClient.request(shopQuery)
    console.debug(data, errors, extensions)
    return data && data['shop']
  }
}
