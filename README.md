# Solana NFT Monitor

Monitors Solana NFT projects at **MagicEden**, **Solanart**, **Alpha Art** and **Exchange Art** marketplaces and updates data every 20min.

Browse all data at https://flatgithub.com/moon-landing-crew/solana-nft-monitor and use "Data File" picker to select one of the available collections.

### Tracked collections

* Saiba Gang
* The Tower
* Gloom Punk Club
* Solsunsets
* Crypto Cultists
* ... and a few more - check the site!

### Requesting new collections

If you want us to add a new collection to the site, please submit an issue by clicking [this link](https://github.com/moon-landing-crew/solana-nft-monitor/issues/new?assignees=&labels=add+collection&template=request-a-new-collection-listing.md).

Thanks!

### The add_collection.rb script

There's a very rough Ruby script that'll generate the required files. You just need to give it the collection identifiers for Moonrank, Magic Eden, Solanart, Alpha Art and Exchange Art (in that order):

```shell
# ruby scripts/add_collection.rb <moonrank_id> <magiceden_id> <solanart_id> <alphaart_id> <exchangeart_id>
$ ruby scripts/add_collection.rb towerdao the_tower thetower the-tower Tower
```

You can find these identifiers by looking at the URLs:

* https://moonrank.app/collection/towerdao
* https://magiceden.io/marketplace/the_tower
* https://solanart.io/collections/thetower
* https://alpha.art/collection/the-tower
* https://exchange.art/collections/Tower

If a collection is not available in one of the marketplaces, set their identifier to `""`:

```shell
$ ruby scripts/add_collection.rb crypto_cultists crypto_cultist "" "" ""
```

This would skip Solanart, Alpha Art and Exchange Art for the Crypto Cultists collection, for example.

### About `.github/moonrank`

Flat Github doesn't allow you to configure ignored files, so moonrank json files were showing up in the Data File dropdown. There's an open issue about this, but in the mean time I found that [they ignore](https://github.com/githubocto/flat-viewer/blob/main/src/api/index.ts#L49) the `.vscode` and `.github` directories, so that's why I put the moonrank directory there.

And I did the same with `.github/collections.json`, which defines the collections we support. And for Alpha Art axios configs 😅.

### Was this useful?

We're glad 😊 We accept tips! Solana wallet: `6HvBqNvZ8zTJRshvaDyLCqXm6V5wM5Dgke4tvjoUw6KP`

### Credits

* [@braposo](https://github.com/braposo) built the original [Gloom Monitor](https://github.com/braposo/gloom-monitor) and is the resident TypeScript guy!
* [@pgaspar](https://github.com/pgaspar) extendeded the monitor to support multiple collections, added support for Alpha Art and Exchange Art and writes the Ruby scripts.

This project was originally on **pgaspar/solana-nft-monitor**, but we moved it to the **Moon Landing Crew** organization, where we keep working on it together 🚀
