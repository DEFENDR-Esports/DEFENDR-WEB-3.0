# Configuration d'un Vrai Nœud IPFS

## 🚀 **Installation IPFS**

### **1. Installer IPFS Desktop (Recommandé)**
```bash
# Télécharger depuis: https://github.com/ipfs/ipfs-desktop/releases
# Ou installer via npm
npm install -g ipfs-desktop
```

### **2. Installer IPFS CLI**
```bash
# Windows (avec Chocolatey)
choco install ipfs

# Ou télécharger depuis: https://dist.ipfs.io/#go-ipfs
```

## ⚙️ **Configuration**

### **1. Initialiser IPFS**
```bash
ipfs init
```

### **2. Démarrer le nœud**
```bash
ipfs daemon
```

### **3. Vérifier la connexion**
```bash
ipfs id
```

## 🔧 **Intégration avec DEFENDR**

### **1. Modifier le service IPFS**
Remplacer le service simulé par un vrai service IPFS :

```typescript
// src/ipfs/ipfs.service.ts
import { create } from 'ipfs-http-client';

@Injectable()
export class IpfsService {
  private ipfs: any;

  async onModuleInit() {
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' });
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<IpfsUploadResult> {
    const result = await this.ipfs.add(buffer, {
      pin: true,
      progress: (prog) => console.log(`Upload progress: ${prog}`)
    });
    
    return {
      cid: result.cid.toString(),
      size: result.size,
      path: result.path
    };
  }
}
```

### **2. Installer les dépendances**
```bash
npm install ipfs-http-client
```

## 🌐 **URLs de Test**

Une fois configuré, vos images seront accessibles via :
- **Local**: `http://localhost:8080/ipfs/{CID}`
- **Public**: `https://ipfs.io/ipfs/{CID}`
- **Gateway**: `https://gateway.pinata.cloud/ipfs/{CID}`

## ✅ **Avantages**

1. **Vraies images IPFS** - Accessibles partout
2. **Persistance** - Images stockées de façon permanente
3. **Décentralisation** - Pas de serveur central
4. **HashScan compatible** - Affichage correct des images

## 🎯 **Alternative Rapide**

Pour tester rapidement, utilisez un service IPFS public :
- **Pinata**: https://pinata.cloud
- **Infura IPFS**: https://infura.io
- **Web3.Storage**: https://web3.storage


