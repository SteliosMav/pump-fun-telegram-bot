This folder should be updated in a separate `scripts` to not trigger unnecessary deploys on production. This branch should not be merged back to main (to not trigger deploys) but main can be merged to this branch so that it always is up to date with the latest services and functionalities of the main branch.

## Usage

run `npm run start:script <script-name>`

example: `npm run start:script create-pump-fun-profile`
