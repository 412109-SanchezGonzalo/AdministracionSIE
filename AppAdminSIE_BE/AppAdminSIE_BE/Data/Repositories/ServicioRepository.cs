using AppAdminSIE_BE.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class ServicioRepository : IServicioRepository
    {
        private readonly string _connectionString;
        public ServicioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void Add(string tipo)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("INSERT INTO Servicio (descripcion) " +
                                        "VALUES (@servicio)", conn);
            cmd.Parameters.AddWithValue("@servicio",tipo);
            conn.Open();
            cmd.ExecuteNonQuery();
        }
        public IEnumerable<Servicio> GetAll()
        {
            var list = new List<Servicio>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Servicio", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Servicio
                {
                    IdServicio = reader.GetInt32(reader.GetOrdinal("id_servicio")),
                    Descripcion = reader.GetString(reader.GetOrdinal("descripcion")),
                });
            }
            return list;
        }
    }
}
