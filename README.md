# merkel-tree
A Merkle Tree implementation written in Typescript.

## What are Merkle Trees?
Merkle trees are a hash-based data structure used to efficiently summarize and verify large sets of data. In Bitcoin, each block's transactions are organized into a Merkle tree, where individual transaction hashes are repeatedly paired and hashed until a single "Merkle root" remains, ensuring that any alteration to a transaction invalidates the entire tree. This allows Bitcoin nodes to verify transactions without storing the entire blockchain, improving security and performance.

> In Bitcoin, it's used to summarize all transactions in a block with a single hash: the Merkle Root.

## Example
Let’s say we have 4 transactions in a block:

```js
    Tx0: "Alice → Bob : 1 BTC"
    Tx1: "Charlie → Dave : 2 BTC"
    Tx2: "Eve → Frank : 1.5 BTC"
    Tx3: "George → Hannah : 3 BTC"
```

### Steps
1. Hash each transaction
```js
    H0 = hash(Tx0) => "a1"
    H1 = hash(Tx1) => "b2"
    H2 = hash(Tx2) => "c3"
    H3 = hash(Tx3) => "d4"
```

2. Pair and hash the pairs
```js
    H01 = hash(H0 + H1) = hash("a1b2") = "e5"
    H23 = hash(H2 + H3) = hash("c3d4") = "f6"
```

3. Hash again to get the Merkle Root
`Merkle Root = hash(H01 + H23) = hash("e5f6"rzez) = "r7"`

> This root hash, r7, uniquely summarizes the entire set of transactions.

The last hash was copied and added to the end of the list. This is needed to be able to concatenate it with itself and hash it, since we hash in pair and if the hash list length is odd, then we copy it and add it to the end of the list to make the hash list even. Each of the tree levels is called a **hash list**.

## Why is it secure?
If any transaction changes, its hash changes, which affects all parent nodes up to the root.

## Representation
![merkel path](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*2njhwo1GT1OyeiDFynWqJw.jpeg)

If we are interested in verifying if the hash 41b6 is actually included in the Merkle root (da07) then we would only need to have the hashes in color:

[41b6, a8c0, 1013, b5fb, f94a]

With 41b6, we need a8c0 to reconstruct 8fca.
With 8fca, we need 1013 to reconstruct 87fd.
With 87fd, we need b5fb to reconstruct 7460.
With 7460 we need f94a to reconstruct da07, the Merkle root.

> With this information, we notice a pattern and we can determine that we only need about log(n) number of hashes to be able to check if a hash belongs to a certain Merkle root, which is really efficient, instead of having to hash them all or to have all the hashes to verify that.

## Real world example
Blockchains like Bitcoin use Merkle trees to check if a transaction belongs to the Merkle root in a block header.
Bitcoin, for example, converts the concatenated hash to binary first, before hashing it.
Bitcoin also uses a double sha256 hash, something like:

`const result = sha256(sha256(binaryOfTheConcatenatedPairOfHashes))`

## Code 
We are going to use sha256 to hash the concatenation of our hashes. So, we will have 64 character hashes.

```js
const merkleRoot = generateMerkleRoot(HASH_VALUE);
console.log('\x1b[36m%s\x1b[0m', 'merkleRoot:', merkleRoot);
```

# Resources
- https://github.com/bitcoin/bitcoin/blob/master/src/consensus/merkle.cpp
