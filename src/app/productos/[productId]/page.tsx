// src/app/productos/[productId]/page.tsx
import React from 'react';

interface ProductPageProps {
  params: {
    productId: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = params;

  return (
    <div>
      <h1>Detalle del Producto</h1>
      <p>ID del Producto: {productId}</p>
      {/* Aquí podrás añadir la lógica para cargar y mostrar los datos del producto */}
    </div>
  );
}