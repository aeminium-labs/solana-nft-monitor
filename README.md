# Solana NFT Monitor

Monitors Solana NFT projects at **MagicEden**, **Solanart** and **Alpha Art** marketplaces and updates data every 20min.

Browse all data at https://flatgithub.com/pgaspar/solana-nft-monitor and use "Data File" picker to select one of the available collections.

### Tracked collections

* Saiba Gang
* The Tower
* Gloom Punk Club
* Solsunsets
* Crypto Cultists
* ... and a few more - check the site!

### Adding new collections

I added a very rough Ruby script that'll generate the required files. You just need to give it the collection identifiers for Moonrank, Magic Eden, Solanart and Alpha Art (in that order):

```shell
# ruby scripts/add_collection.rb <moonrank_id> <magiceden_id> <solanart_id> <alphaart_id>
$ ruby scripts/add_collection.rb towerdao the_tower thetower the-tower
```

You can find these identifiers by looking at the URLs:

* https://moonrank.app/collection/towerdao
* https://magiceden.io/marketplace/the_tower
* https://solanart.io/collections/thetower
* https://alpha.art/collection/the-tower

If a collection is not available in one of the marketplaces, set their identifier to `""`:

```shell
$ ruby scripts/add_collection.rb crypto_cultists crypto_cultist "" ""
```

This would skip Solanart and Alpha Art for the Crypto Cultists collection, for example.

### About `.github/moonrank`

Flat Github doesn't allow you to configure ignored files, so moonrank json files were showing up in the Data File dropdown. There's an open issue about this, but in the mean time I found that [they ignore](https://github.com/githubocto/flat-viewer/blob/main/src/api/index.ts#L49) the `.vscode` and `.github` directories, so that's why I put the moonrank directory there.

And I did the same with `.github/collections.json`, which defines the collections we support. And for Alpha Art axios configs 😅.

### Was this useful?

I'm glad 😊 I accept tips! Solana wallet: `6HvBqNvZ8zTJRshvaDyLCqXm6V5wM5Dgke4tvjoUw6KP`

### Credits

Thanks to [@braposo](https://github.com/braposo) for working on the original [Gloom Monitor](https://github.com/braposo/gloom-monitor)!
