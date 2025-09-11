using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;

namespace AppAdminSIE_BE.Data.Repositories
{
    public class PedidoRepository : IPedidoRepository
    {

        private readonly string _connectionString;
        public PedidoRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public IEnumerable<Pedido> GetAllPedidos()
        {
            var list = new List<Pedido>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Pedidos", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Pedido
                {
                    IdPedido = reader.GetInt32(reader.GetOrdinal("id_pedido")),
                    FechaEntrega = reader.GetDateTime(reader.GetOrdinal("Fecha de entrega")),
                    Estado = reader.GetString(reader.GetOrdinal("Estado")),
                    FechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion"))
                });
            }
            return list;
        }
        public int AddPedido(DateTime fechaEntrega)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "INSERT INTO Pedidos (FechaEntrega,Estado , FechaCreacion) " +
                "VALUES (@FechaEntrega,@Estado,@fechaCreacion); " +
                "SELECT LAST_INSERT_ID();", conn))
            {
                cmd.Parameters.AddWithValue("@FechaEntrega",fechaEntrega);
                cmd.Parameters.AddWithValue("@Estado", "Pendiente");
                DateTime fechaCreacion = DateTime.Now;
                cmd.Parameters.AddWithValue("@fechaCreacion", fechaCreacion);

                conn.Open();

                // ✅ AGREGAR ESTOS LOGS PARA DEBUG:
                var result = cmd.ExecuteScalar();
                Console.WriteLine($"Resultado de ExecuteScalar: {result}");
                Console.WriteLine($"Tipo de resultado: {result?.GetType()}");

                int id = Convert.ToInt32(result);
                Console.WriteLine($"ID convertido: {id}");

                return id;
            }
        }

        public void UpdateEstado(int idPedido)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "UPDATE Pedidos SET Estado = 'Entregado' " +
                "WHERE id_pedido = @idPedido", conn))
            {
                cmd.Parameters.AddWithValue("@idPedido", idPedido);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
