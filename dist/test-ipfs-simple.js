"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const helia_1 = require("helia");
const unixfs_1 = require("@helia/unixfs");
async function testIpfs() {
    var _a, e_1, _b, _c;
    try {
        console.log('🚀 Test simple IPFS...');
        const helia = await (0, helia_1.createHelia)();
        const fs = (0, unixfs_1.unixfs)(helia);
        console.log('✅ Helia créé');
        const testData = Buffer.from('Hello IPFS from DEFENDR!', 'utf8');
        const cid = await fs.addBytes(testData);
        console.log('✅ Fichier uploadé:');
        console.log(`   CID: ${cid.toString()}`);
        const chunks = [];
        try {
            for (var _d = true, _e = __asyncValues(fs.cat(cid)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                chunks.push(chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const retrievedData = Buffer.concat(chunks);
        console.log('✅ Fichier récupéré:');
        console.log(`   Contenu: ${retrievedData.toString()}`);
        await helia.stop();
        console.log('✅ Test terminé avec succès !');
    }
    catch (error) {
        console.error('❌ Erreur:', error);
    }
}
testIpfs();
//# sourceMappingURL=test-ipfs-simple.js.map