using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;

namespace AppAdminSIE_BE.Data.Repositories
{
    public class EdificioRepository : IEdificioRepository
    {
        private readonly string _connectionString;
        public EdificioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public IEnumerable<Edificio> GetAllEdificios()
        {
            var list = new List<Edificio>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Edificio", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Edificio
                {
                    Id_Edificio = reader.GetInt32(reader.GetOrdinal("id_edificio")),
                    Nombre = reader.GetString(reader.GetOrdinal("nombre")),
                    Calle = reader.GetString(reader.GetOrdinal("calle")),
                    Numeracion = reader.GetString(reader.GetOrdinal("numeracion")),
                    Observaciones = reader.GetString(reader.GetOrdinal("observaciones"))
                });
            }
            return list;
        }
    }
}
