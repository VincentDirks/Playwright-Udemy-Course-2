import { expect, test as setup } from "@playwright/test"

setup("delete article", async ({ request }) => {
  // Clean up
  // delete the article using the slug extracted earlier
  const articleDeleteResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`
  )
  expect(articleDeleteResponse.status()).toEqual(204)
})
