using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using Mysqlx.Cursor;

namespace AppAdminSIE_BE.Data.Repositories
{
    public class PedidoXProductoRepository : IPedidoXProductoRepository
    {
        private readonly string _connectionString;
        public PedidoXProductoRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public IEnumerable<PedidoXProducto> GetAllPedidoXProductos()
        {
            var listaPedidosXProductos = new List<PedidoXProducto>();
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(@"
                                    SELECT
                                        pxp.id_pedidoxproducto,
                                        pxp.pedido_id,
                                        ped.Estado,
                                        pxp.producto_id,
                                        pro.Nombre,
                                        pxp.cantidad,
                                        pro.UnidadMedida
                                    FROM PedidoXProducto pxp
                                    JOIN Pedidos ped ON pxp.pedido_id = ped.id
                                    JOIN Productos pro ON pxp.producto_id = pro.id", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    // Mapeamos las columnas correctas de la consulta SQL
                    var ordIdPXP = reader.GetOrdinal("id_pedidoxproducto");
                    var ordIdPedido = reader.GetOrdinal("pedido_id");
                    var ordEstado = reader.GetOrdinal("Estado");
                    var ordIdProducto = reader.GetOrdinal("producto_id");
                    var ordNombreProducto = reader.GetOrdinal("Nombre");
                    var ordCantidad = reader.GetOrdinal("cantidad");
                    var ordUnidadMedida = reader.GetOrdinal("UnidadMedida");

                    while (reader.Read())
                    {
                        listaPedidosXProductos.Add(new PedidoXProducto
                        {
                            // Asignamos los valores del lector a las propiedades del objeto PedidoXProducto
                            IdPedidoXProducto = reader.GetInt32(ordIdPXP),
                            IdPedido = reader.GetInt32(ordIdPedido),
                            IdProducto = reader.GetInt32(ordIdProducto),
                            Cantidad = reader.GetDouble(ordCantidad), // Usar GetDouble para manejar decimales
                            EstadoPedido = reader.GetString(ordEstado),
                            NombreProducto = reader.GetString(ordNombreProducto),
                            UnidadMedidaProducto = reader.GetString(ordUnidadMedida)
                        });
                    }
                }
            }
            return listaPedidosXProductos;
        }

       
    }
}
