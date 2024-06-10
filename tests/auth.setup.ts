import { test as setup } from "@playwright/test"
import user from "../.auth/user.json"
import fs from "fs"

const authfile = ".auth/user.json"

setup("authentication", async ({ request }) => {
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

  user.origins[0].localStorage[0].value = accessToken
  fs.writeFileSync(authfile, JSON.stringify(user))
  process.env['ACCESS_TOKEN'] = accessToken
})
