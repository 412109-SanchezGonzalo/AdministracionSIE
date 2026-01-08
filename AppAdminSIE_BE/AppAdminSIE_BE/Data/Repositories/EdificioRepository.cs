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
                    Numeracion = reader.GetString(reader.GetOrdinal("numeracion"))
                });
            }
            return list;
        }

        public void Add(Edificio edificio)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            using var transaction = conn.BeginTransaction();
            try
            {
                string sqlEdificio = @"INSERT INTO Edificio (nombre, calle, numeracion) 
                              VALUES (@nombre, @calle, @numeracion);
                              SELECT LAST_INSERT_ID();";

                using var cmd = new MySqlCommand(sqlEdificio, conn, transaction);
                cmd.Parameters.AddWithValue("@nombre", edificio.Nombre);
                cmd.Parameters.AddWithValue("@calle", edificio.Calle);
                cmd.Parameters.AddWithValue("@numeracion", edificio.Numeracion);

                int nuevoIdEdificio = Convert.ToInt32(cmd.ExecuteScalar());

                transaction.Commit();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}

