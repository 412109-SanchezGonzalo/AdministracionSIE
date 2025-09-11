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
                                        pxp.id_edificio,
                                        e.nombre as Edificio,
                                        pxp.pedido_id,
                                        ped.Estado,
                                        pxp.producto_id,
                                        pro.Nombre as Producto,
                                        pxp.cantidad as Cantidad,
                                        pro.UnidadMedida,
                                        pxp.observaciones 
                                    FROM PedidoXProducto pxp
                                    JOIN Pedidos ped ON pxp.pedido_id = ped.id_pedido
                                    JOIN Productos pro ON pxp.producto_id = pro.id 
                                    JOIN Edificio e ON pxp.id_edificio = e.id_edificio", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    // Mapeamos las columnas correctas de la consulta SQL
                    var ordIdPXP = reader.GetOrdinal("id_pedidoxproducto");
                    var ordIdEdificio = reader.GetOrdinal("Edificio");
                    var ordIdPedido = reader.GetOrdinal("pedido_id");
                    var ordEstado = reader.GetOrdinal("Estado");
                    var ordIdProducto = reader.GetOrdinal("producto_id");
                    var ordNombreProducto = reader.GetOrdinal("Producto");
                    var ordCantidad = reader.GetOrdinal("Cantidad");
                    var ordUnidadMedida = reader.GetOrdinal("UnidadMedida");
                    var ordObservaciones = reader.GetOrdinal("observaciones");

                    while (reader.Read())
                    {
                        listaPedidosXProductos.Add(new PedidoXProducto
                        {
                            // Asignamos los valores del lector a las propiedades del objeto PedidoXProducto
                            IdPedidoXProducto = reader.GetInt32(ordIdPXP),
                            IdPedido = reader.GetInt32(ordIdPedido),
                            IdProducto = reader.GetInt32(ordIdProducto),
                            IdEdificio = reader.GetInt32(ordIdEdificio),
                            Cantidad = reader.GetDouble(ordCantidad), // Usar GetDouble para manejar decimales
                            EstadoPedido = reader.GetString(ordEstado),
                            NombreProducto = reader.GetString(ordNombreProducto),
                            UnidadMedidaProducto = reader.GetString(ordUnidadMedida),
                            Observaciones = reader.IsDBNull(ordObservaciones) ? null : reader.GetString(ordObservaciones)
                        });
                    }
                }
            }
            return listaPedidosXProductos;
        }

        public void AddPedidoXProducto(PedidoXProducto pedidoxproducto)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand(
                "INSERT INTO PedidoXProducto (pedido_id,producto_id,cantidad,id_edificio,observaciones) " +
                "VALUES (@idPedido, @idProducto, @Cantidad, @idEdificio, @Observaciones)", conn);

            cmd.Parameters.AddWithValue("@idPedido", pedidoxproducto.IdPedido);
            cmd.Parameters.AddWithValue("@idProducto", pedidoxproducto.IdProducto);
            cmd.Parameters.AddWithValue("@Cantidad",pedidoxproducto.Cantidad);
            cmd.Parameters.AddWithValue("@idEdificio", pedidoxproducto.IdEdificio);
            cmd.Parameters.AddWithValue("@Observaciones", pedidoxproducto.Observaciones);         

            conn.Open();
            cmd.ExecuteNonQuery();
        }



    }
}
