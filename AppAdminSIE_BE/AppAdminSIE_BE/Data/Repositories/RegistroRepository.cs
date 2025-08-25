using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class RegistroRepository : IRegistroRepository
    {
        private readonly string _connectionString;
        public RegistroRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void Add(Registro registro)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "INSERT INTO Registro (hora_ingreso, hora_salida, id_usuario, fecha) " +
                "VALUES (@horaIngreso, @horaSalida, @idUsuario, @fecha)", conn))
            {
                cmd.Parameters.AddWithValue("@horaIngreso", registro.HoraIngreso);
                cmd.Parameters.AddWithValue("@horaSalida", (object)registro.HoraSalida ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@idUsuario", registro.IdUsuario);
                cmd.Parameters.AddWithValue("@fecha",registro.Fecha);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public Registro GetById(int id)
        {
            Registro registro = null;

            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand("SELECT * FROM Registro WHERE id_registro = @id", conn))
            {
                cmd.Parameters.AddWithValue("@id", id);
                conn.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    int idxIdRegistro = reader.GetOrdinal("id_registro");
                    int idxIdUsuario = reader.GetOrdinal("id_usuario");
                    int idxHoraEntrada = reader.GetOrdinal("hora_ingreso");
                    int idxHoraSalida = reader.GetOrdinal("hora_salida");
                    int idxFecha = reader.GetOrdinal("fecha");

                    if (reader.Read())
                    {
                        registro = new Registro
                        {
                            IdRegistro = reader.GetInt32(idxIdRegistro),
                            IdUsuario = reader.GetInt32(idxIdUsuario),
                            HoraIngreso = reader.GetString(idxHoraEntrada),
                            HoraSalida = reader.GetString(idxHoraSalida),
                            Fecha = reader.GetDateTime(idxFecha)
                        };
                    }
                }
            }
            return registro;
        }

        public IEnumerable<Registro> GetByUsuario(int idUsuario)
        {
            var registros = new List<Registro>();

            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand("SELECT fecha,hora_ingreso,hora_salida FROM Registro WHERE id_usuario = @idUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
                conn.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    int idxHoraEntrada = reader.GetOrdinal("hora_ingreso");
                    int idxHoraSalida = reader.GetOrdinal("hora_salida");
                    int idxFecha = reader.GetOrdinal("fecha");

                    while (reader.Read())
                    {
                        registros.Add(new Registro
                        {
                            HoraIngreso = reader.GetString(idxHoraEntrada),
                            HoraSalida = reader.GetString(idxHoraSalida),
                            Fecha = reader.GetDateTime(idxFecha)                                                                                                               
                        });
                    }
                }
            }
            return registros;
        }

        public void UpdateSalida(int idRegistro, string horaSalida)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "UPDATE Registro SET hora_salida = @horaSalida WHERE id_registro = @idRegistro", conn))
            {
                cmd.Parameters.AddWithValue("@horaSalida", horaSalida);
                cmd.Parameters.AddWithValue("@idRegistro", idRegistro);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
