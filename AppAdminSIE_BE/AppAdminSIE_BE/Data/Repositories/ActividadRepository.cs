using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class ActividadRepository : IActividadRepository
    {
        private readonly string _connectionString;
        public ActividadRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void Add(string tipo)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("INSERT INTO Actividad (tipo_actividad) " +
                                        "VALUES (@actividad)", conn);
            cmd.Parameters.AddWithValue("@actividad",tipo);
            conn.Open();
            cmd.ExecuteNonQuery();
        }
        public IEnumerable<Actividad> GetAll()
        {
            var list = new List<Actividad>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Servicio", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Actividad
                {
                    IdActividad = reader.GetInt32(reader.GetOrdinal("id_actividad")),
                    Descripcion = reader.GetString(reader.GetOrdinal("descripcion")),
                });
            }
            return list;
        }
    }
}
