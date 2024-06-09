import { test, expect } from "@playwright/test"
import responseBody from "../test-data/tags.json"

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(responseBody),
    })
  })

  await page.goto("https://conduit.bondaracademy.com/")
})

test("has title", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK description"

    await route.fulfill({ body: JSON.stringify(responseBody) })
  })

  await page.getByText("Global Feed").click()

  await expect(page.locator(".navbar-brand")).toHaveText("conduit")
  await expect(
    page.locator(".tag-default.tag-pill", { hasText: "Playwright" })
  ).toBeVisible()

  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is a MOCK test title"
  )
  await expect(page.locator("app-article-list p").first()).toContainText(
    "This is a MOCK description"
  )
})

test("Delete Article", async ({ page, request }) => {
  const response = await request.post(
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
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Test Title",
          description: "Test description",
          body: "Test body",
          tagList: [],
        },
      },
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  )
  expect(articleResponse.status()).toEqual(201)

  await page.getByText("Global Feed").click()
  await page.getByText("Test Title").click()
  await page.getByRole("button", { name: "Delete Article" }).first().click()
  await page.getByText("Global Feed").click()
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "Test Title"
  )
})

test("create article", async ({ page, request }) => {
  // Use the web ui to create the article
  await page.getByText("New Article").click()
  await page
    .getByRole("textbox", { name: "Article Title" })
    .fill("Playwright is awesome")
  await page
    .getByRole("textbox", { name: "What's this article about?" })
    .fill("About Playwright")
  await page
    .getByRole("textbox", { name: "Write your article (in markdown)" })
    .fill("We like to use Playwright for automation")
  await page.getByRole("button", { name: "Publish Article" }).click()

  // intercept the API response to extract the slug which is needed for clean up later
  const articleResponse = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  )
  const articleresponseBody = await articleResponse.json()
  const slugID = articleresponseBody.article.slug

  // Assert that article was created
  await expect(page.locator(".article-page h1")).toContainText(
    "Playwright is awesome"
  )

  // Go to global feed
  await page.getByText("Home").click()
  await page.getByText("Global Feed").click()

  // Assert new article is listed
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "Playwright is awesome"
  )

  // Clean up
  // Obtain access token for API call
  const response = await request.post(
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
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  // delete the article using the slug extracted earlier
  const articleDeleteResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugID}`,
    {
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  )
  expect(articleDeleteResponse.status()).toEqual(204)
})
