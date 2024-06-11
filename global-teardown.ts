import { request, expect } from "@playwright/test"

async function globalTeardown() {
  const context = await request.newContext()

  // Clean up
  // delete the article using the slug extracted earlier
  const articleDeleteResponse = await context.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`,
    {
      headers: { Authorization: `Token ${process.env.ACCESS_TOKEN}` },
    }
  )
  expect(articleDeleteResponse.status()).toEqual(204)
}

export default globalTeardown