import { expect, request } from "@playwright/test"
import user from "./.auth/user.json"
import fs from "fs"

async function globalSetup() {
  const authfile = ".auth/user.json"
  const context = await request.newContext()

  const responseToken = await context.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "conduit@dirksonline.net",
          password: "qB85R86#ZMKME$jVEVq#vJMDr*A!cJk",
        },
      },
    }
  )
  const responseBody = await responseToken.json()
  const accessToken = responseBody.user.token

  user.origins[0].localStorage[0].value = accessToken
  fs.writeFileSync(authfile, JSON.stringify(user))
  process.env["ACCESS_TOKEN"] = accessToken

  const articleResponse = await context.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Global Likes Test Article",
          description: "Test description",
          body: "Test body",
          tagList: [],
        },
      },
      headers: { Authorization: `Token ${accessToken}` },
    }
  )
  expect(articleResponse.status()).toEqual(201)

  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug
  process.env["SLUGID"] = slugId
}

export default globalSetup
