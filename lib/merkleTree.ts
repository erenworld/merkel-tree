import * as crypto from 'crypto';

const HASH_VALUE: string[] = [
    '95cd603fe577fa9548ec0c9b50b067566fe07c8af6acba45f6196f3a15d511f6',
    '709b55bd3da0f5a838125bd0ee20c5bfdd7caba173912d4281cae816b79a201b',
    '27ca64c092a959c7edc525ed45e845b1de6a7590d173fd2fad9133c8a779a1e3',
    '1f3cb18e896256d7d6bb8c11a6ec71f005c75de05e39beae5d93bbd1e2c8b7a9',
    '41b637cfd9eb3e2f60f734f9ca44e5c1559c6f481d49d6ed6891f3e9a086ac78',
    'a8c0cce8bb067e91cf2766c26be4e5d7cfba3d3323dc19d08a834391a1ce5acf',
    'd20a624740ce1b7e2c74659bb291f665c021d202be02d13ce27feb067eeec837',
    '281b9dba10658c86d0c3c267b82b8972b6c7b41285f60ce2054211e69dd89e15',
    'df743dd1973e1c7d46968720b931af0afa8ec5e8412f9420006b7b4fa660ba8d',
    '3e812f40cd8e4ca3a92972610409922dedf1c0dbc68394fcb1c8f188a42655e2',
    '3ebc2bd1d73e4f2f1f2af086ad724c98c8030f74c0c2be6c2d6fd538c711f35c',
    '9789f4e2339193149452c1a42cded34f7a301a13196cd8200246af7cc1e33c3b',
    'aefe99f12345aabc4aa2f000181008843c8abf57ccf394710b2c48ed38e1a66a',
    '64f662d104723a4326096ffd92954e24f2bf5c3ad374f04b10fcc735bc901a4d',
    '95a73895c9c6ee0fadb8d7da2fac25eb523fc582dc12c40ec793f0c1a70893b4',
    '315987563da5a1f3967053d445f73107ed6388270b00fb99a9aaa26c56ecba2b',
    '09caa1de14f86c5c19bf53cadc4206fd872a7bf71cda9814b590eb8c6e706fbb',
    '9d04d59d713b607c81811230645ce40afae2297f1cdc1216c45080a5c2e86a5a',
    'ab8a58ff2cf9131f9730d94b9d67f087f5d91aebc3c032b6c5b7b810c47e0132',
    'c7c3f15b67d59190a6bbe5d98d058270aee86fe1468c73e00a4e7dcc7efcd3a0',
    '27ef2eaa77544d2dd325ce93299fcddef0fae77ae72f510361fa6e5d831610b2'
];

const LEFT = 'left' as const;
const RIGHT = 'right' as const;
type LeafSide = typeof LEFT | typeof RIGHT;

/** Hash function that returns hex string */
const sha256 = (data: string): string => {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest()
        .toString('hex');
};

/**
 * Returns 'left' or 'right' depending on the hash position in the Merkle tree's leaves
 * @param hash leaf hash to find
 * @param merkleTree array of levels, where merkleTree[0] = leaves
 * @returns 'left' | 'right'
 */
const getLeafSide = (hash: string, merkleTree: string[][]): LeafSide => {
    const hashIndex = merkleTree[0].findIndex(h => h === hash);
    if (hashIndex === -1) {
        throw new Error(`Hash not found in leaf nodes`);
    }
    return hashIndex % 2 === 0 ? LEFT : RIGHT;
};

/**
 * Ensure array length is even by duplicating last element if needed
 * @param hashes array of hashes
 * @returns new array with even length
 */
function ensureHashesEven(hashes: string[]): string[] {
    return hashes.length % 2 === 0
        ? [...hashes]
        : [...hashes, hashes[hashes.length - 1]];
}

/**
 * Generates the Merkle root of the hashes passed through the parameter.
 * Recursively concatenates pairs of hashes and calculates each sha256 hash of the
 * concatenated hashes until only one hash is left, which is the Merkle root.
 * @param hashes array of leaf hashes (strings)
 * @returns Merkle root hash string
 */
function generateMerkleRoot(hashes: string[]): string {
    if (!hashes || hashes.length === 0) {
        throw new Error('Missing arguments: hashes');
    }
    const evenHashes = ensureHashesEven(hashes);
    const combinedHashes: string[] = [];

    for (let i = 0; i < evenHashes.length; i += 2) {
        const hashPair = evenHashes[i] + evenHashes[i + 1];
        const hash = sha256(hashPair);
        combinedHashes.push(hash);
    }

    if (combinedHashes.length === 1) {
        return combinedHashes[0];
    }

    return generateMerkleRoot(combinedHashes);
}

/**
 * Builds a Merkle tree from a list of hashes.
 * The tree is represented as an array of levels (array of arrays).
 *
 * - `tree[0]` contains the original hashes (leaf nodes).
 * - Each next level combines pairs of hashes from the previous level using SHA-256.
 * - The last level (`tree[tree.length - 1]`) contains a single hash: the Merkle root.
 * @param {Array<string>} hashes
 * @returns {Array<Array<string>>} merkelTree
 */
function generateMerkleTree(hashes: string[]): string[][] {
    if (!hashes || hashes.length === 0) {
        return [];
    }  
    
    const tree: string[][] = [hashes];
    const generate = (hashes: string[], tree: string[][]): string[] => {
        if (hashes.length === 1) return hashes;

        const evenHashes = ensureHashesEven(hashes);
        const combinedHashes: string[] = [];
        for (let i = 0; i < evenHashes.length; i += 2) {
            const concatHashes = evenHashes[i] + evenHashes[i + 1];
            const hash = sha256(concatHashes);
            combinedHashes.push(hash);
        }
        tree.push(combinedHashes);
        return generate(combinedHashes, tree);
    }
    generate(hashes, tree);
    return tree;
}

const merkleTree = generateMerkleTree(HASH_VALUE);
console.log('merkleTree: ', merkleTree); // Last level, the root, the Merkle root.

/**
 * @param {string} hash
 * @param {Array<string>} hashes
 * @returns {Array<node>} merkeProof
 */
function generateMerkleProof(hash: string, hashes: Array<string>) {
    if (!hash || !hashes || hashes.length === 0) {
        throw new Error('Invalid hash');
    }
    const tree = generateMerkleTree(hashes);
    const merkleProof = [
        {
            hash,
            direction: getLeafSide(hash, tree)
        }
    ];
    let hashIndex = tree[0].findIndex(h => h === hash);
    for (let level = 0; level < tree.length - 1; level++) {
        const isLeftChild = hashIndex % 2 === 0;
        const siblingSide = isLeftChild ? LEFT : RIGHT;
        const siblingIndex = isLeftChild ? hashIndex + 1 : hashIndex - 1;
        const siblingNode = {
            hash: tree[level][siblingIndex],
            direction: siblingSide
        };
        merkleProof.push(siblingNode);
        hashIndex = Math.floor(hashIndex / 2);
    }
    return merkleProof;
}

const generatedMerkleProof = generateMerkleProof(HASH_VALUE[4], HASH_VALUE);
console.log('generatedMerkleProof: ', generatedMerkleProof);
