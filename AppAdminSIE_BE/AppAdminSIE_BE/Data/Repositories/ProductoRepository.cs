using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;

namespace AppAdminSIE_BE.Data.Repositories
{
    public class ProductoRepository : IProductoRepository
    {
        private readonly string _connectionString;
        public ProductoRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public IEnumerable<Producto> GetAllProducto()
        {
            var list = new List<Producto>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Productos", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Producto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                    Iva = reader.GetInt32(reader.GetOrdinal("IVA")),
                    UnidadMedida = reader.GetString(reader.GetOrdinal("UnidadMedida"))
                });
            }
            return list;
        }

        public Producto GetByName(string nombre)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Productos WHERE Nombre = @name", conn);
            cmd.Parameters.AddWithValue("@name", nombre);
            conn.Open();

            using var reader = cmd.ExecuteReader();

            int idxIdProducto = reader.GetOrdinal("id");
            int idxNombre = reader.GetOrdinal("Nombre");
            int idxIva = reader.GetOrdinal("IVA");
            int idxUnidadMedida = reader.GetOrdinal("UnidadMedida");

            if (reader.Read())
            {
                return new Producto
                {
                    Id = reader.GetInt32(idxIdProducto),
                    Nombre = reader.GetString(idxNombre),
                    Iva = reader.GetInt32(idxIva),
                    UnidadMedida = reader.GetString(idxUnidadMedida)
                };
            }
            return null;
        }
    }
}
