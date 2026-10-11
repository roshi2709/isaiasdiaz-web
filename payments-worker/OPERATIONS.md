# Próximo paso: historial de ventas y correo de confirmación

## 1. Crear D1 (sin afectar los pagos de prueba actuales)
En Cloudflare > Storage & databases > D1 SQL Database > Create database, usar el nombre `isaiasdiaz-books-orders`.

Ejecutar el contenido de `migrations/0001_orders.sql` desde la consola SQL de D1.

## 2. Vincular el Worker
Worker `isaiasdiaz-books-payments` > Settings > Bindings > Add binding > D1 database.
Variable name: `ORDERS_DB`. Database: `isaiasdiaz-books-orders`.

## 3. No activar producción aún
La implementación actual usa KV para enlaces de descarga, pero no registra las ventas en D1 todavía. La migración por sí sola no habilita el registro; requiere desplegar código actualizado.

Pendiente: guardar únicamente las transacciones confirmadas por PayPal; verificar capturas duplicadas e idempotencia; registrar reembolsos; limitar solicitudes; agregar correo transaccional mediante proveedor de email con secreto guardado en Cloudflare. No almacenar credenciales ni datos completos de tarjeta.

## 4. Política de datos
Guardar solamente identificadores de transacción, importe, producto, estado y correo del comprador si está disponible y es necesario para entregar el producto. Definir retención y política de privacidad antes de ventas reales.
