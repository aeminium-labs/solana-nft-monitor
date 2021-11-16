# Solana NFT Monitor

Monitors Solana NFT projects at MagicEden and Solanart marketplaces and updates data every 20min.

Browse all data at https://flatgithub.com/pgaspar/solana-nft-monitor and use "Data File" picker to select one of the available collections.

### Tracked collections

* Saiba Gang
* The Tower
* Gloom Punk Club
* Solsunsets

### Adding new collections

I added a very rough Ruby script that'll generate the required files. You just need to give it the collection identifiers for Moonrank, Magic Eden and Solanart (in that order):

```shell
# ruby add_collection.rb <moonrank_id> <magiceden_id> <solanart_id>
$ ruby add_collection.rb towerdao the_tower thetower
```

You can find these identifiers by looking at the URLs:

* https://moonrank.app/collection/towerdao
* https://magiceden.io/marketplace/the_tower
* https://solanart.io/collections/thetower

If a specific collection is only available at Magic Eden or Solanart, just open the workflow YML file and remove the steps you don't need.

### About `.github/moonrank`

Flat Github doesn't allow you to configure ignored files, so moonrank json files were showing up in the Data File dropdown. There's an open issue about this, but in the mean time I found that [they ignore](https://github.com/githubocto/flat-viewer/blob/main/src/api/index.ts#L49) the `.vscode` and `.github` directories, so that's why I put the moonrank directory there.

### Credits

Thanks to [@braposo](https://github.com/braposo) for working on the original [Gloom Monitor](https://github.com/braposo/gloom-monitor)!
