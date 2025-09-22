# Guía para Manejo de Imágenes de Productos en el Frontend

## 📋 Resumen

Tu backend ya está configurado para manejar imágenes de productos. Aquí tienes toda la información que necesitas para implementar la funcionalidad en tu frontend.

## 🔧 Configuración del Backend

### Variables de Entorno Requeridas
Asegúrate de tener estas variables en tu archivo `.env`:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=business-dashboard

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

## 🚀 Endpoints Disponibles

### 1. Crear Producto con Imagen
**POST** `/api/products`

```javascript
const formData = new FormData();
formData.append('name', 'Mi Producto');
formData.append('description', 'Descripción del producto');
formData.append('pricing', '25.50');
formData.append('categoryProductId', '64a1b2c3d4e5f6789012345');
formData.append('file', imageFile); // Archivo de imagen

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 2. Actualizar Producto con Nueva Imagen
**PUT** `/api/products/:id`

```javascript
const formData = new FormData();
formData.append('name', 'Producto Actualizado');
formData.append('pricing', '30.00');
formData.append('file', newImageFile); // Nueva imagen

const response = await fetch(`/api/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 3. Subir Solo Imagen a Producto Existente
**POST** `/api/products/:id/image`

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch(`/api/products/${productId}/image`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 💻 Ejemplos de Implementación Frontend

### React/JavaScript - Componente de Subida de Imagen

```jsx
import React, { useState } from 'react';

const ProductImageUpload = ({ productId, onImageUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Imagen subida:', result.imageUrl);
        onImageUploaded(result.product);
        setSelectedFile(null);
        setPreview(null);
      } else {
        const error = await response.json();
        console.error('Error:', error.message);
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileSelect}
        className="file-input"
      />
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{maxWidth: '200px'}} />
        </div>
      )}
      
      {selectedFile && (
        <button 
          onClick={uploadImage} 
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? 'Subiendo...' : 'Subir Imagen'}
        </button>
      )}
    </div>
  );
};

export default ProductImageUpload;
```

### Vue.js - Componente de Subida

```vue
<template>
  <div class="image-upload">
    <input
      type="file"
      accept="image/jpeg,image/png,image/gif"
      @change="handleFileSelect"
      ref="fileInput"
    />
    
    <div v-if="preview" class="preview">
      <img :src="preview" alt="Preview" style="max-width: 200px;" />
    </div>
    
    <button 
      v-if="selectedFile" 
      @click="uploadImage" 
      :disabled="uploading"
    >
      {{ uploading ? 'Subiendo...' : 'Subir Imagen' }}
    </button>
  </div>
</template>

<script>
export default {
  props: ['productId'],
  data() {
    return {
      selectedFile: null,
      uploading: false,
      preview: null
    };
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => this.preview = e.target.result;
        reader.readAsDataURL(file);
      }
    },
    
    async uploadImage() {
      if (!this.selectedFile) return;

      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${this.productId}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          this.$emit('image-uploaded', result.product);
          this.selectedFile = null;
          this.preview = null;
        } else {
          const error = await response.json();
          console.error('Error:', error.message);
        }
      } catch (error) {
        console.error('Error de red:', error);
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>
```

### Angular - Servicio y Componente

```typescript
// image-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  uploadProductImage(productId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post(`${this.apiUrl}/${productId}/image`, formData, { headers });
  }
}
```

```typescript
// image-upload.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImageUploadService } from './image-upload.service';

@Component({
  selector: 'app-image-upload',
  template: `
    <div class="image-upload">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        (change)="onFileSelected($event)"
        #fileInput
      />
      
      <div *ngIf="preview" class="preview">
        <img [src]="preview" alt="Preview" style="max-width: 200px;" />
      </div>
      
      <button 
        *ngIf="selectedFile" 
        (click)="uploadImage()" 
        [disabled]="uploading"
      >
        {{ uploading ? 'Subiendo...' : 'Subir Imagen' }}
      </button>
    </div>
  `
})
export class ImageUploadComponent {
  @Input() productId: string;
  @Output() imageUploaded = new EventEmitter<any>();

  selectedFile: File | null = null;
  uploading = false;
  preview: string | null = null;

  constructor(private imageUploadService: ImageUploadService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => this.preview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.imageUploadService.uploadProductImage(this.productId, this.selectedFile)
      .subscribe({
        next: (result) => {
          this.imageUploaded.emit(result.product);
          this.selectedFile = null;
          this.preview = null;
        },
        error: (error) => {
          console.error('Error:', error);
        },
        complete: () => {
          this.uploading = false;
        }
      });
  }
}
```

## 📱 Mostrar Imágenes en el Frontend

### Mostrar Imagen del Producto

```jsx
// React
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      {product.url ? (
        <img 
          src={product.url} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = '/default-product.png'; // Imagen por defecto
          }}
        />
      ) : (
        <div className="no-image">
          <span>Sin imagen</span>
        </div>
      )}
      <h3>{product.name}</h3>
      <p>Bs. {product.pricing}</p>
    </div>
  );
};
```

```vue
<!-- Vue.js -->
<template>
  <div class="product-card">
    <img 
      v-if="product.url" 
      :src="product.url" 
      :alt="product.name"
      class="product-image"
      @error="handleImageError"
    />
    <div v-else class="no-image">
      <span>Sin imagen</span>
    </div>
    <h3>{{ product.name }}</h3>
    <p>Bs. {{ product.pricing }}</p>
  </div>
</template>

<script>
export default {
  props: ['product'],
  methods: {
    handleImageError(event) {
      event.target.src = '/default-product.png';
    }
  }
};
</script>
```

## 🎨 Estilos CSS Recomendados

```css
.image-upload {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 10px 0;
}

.file-input {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview {
  margin: 15px 0;
}

.preview img {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.upload-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.upload-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  width: 100%;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #6c757d;
}
```

## ⚠️ Consideraciones Importantes

1. **Tamaño de Archivo**: Máximo 10MB por imagen
2. **Formatos Permitidos**: JPEG, PNG, GIF
3. **Autenticación**: Todas las rutas requieren token JWT
4. **MinIO**: Asegúrate de que MinIO esté ejecutándose
5. **CORS**: Configura CORS si tu frontend está en un dominio diferente

## 🔍 Debugging

### Verificar Configuración de MinIO
```bash
# Verificar que MinIO esté ejecutándose
curl http://localhost:9000/minio/health/live
```

### Logs del Backend
Revisa los logs del servidor para ver errores de subida:
```bash
# En tu terminal donde corre el backend
# Busca mensajes como:
# ✅ "File uploaded successfully"
# ❌ "Error uploading file to MinIO"
```

## 📞 Soporte

Si tienes problemas:
1. Verifica que MinIO esté ejecutándose
2. Revisa las variables de entorno
3. Confirma que el token JWT sea válido
4. Verifica los logs del backend

¡Tu backend ya está listo para manejar imágenes de productos! 🎉
