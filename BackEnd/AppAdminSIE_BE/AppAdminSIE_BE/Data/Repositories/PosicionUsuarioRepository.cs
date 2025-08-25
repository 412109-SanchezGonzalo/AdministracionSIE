using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class PosicionUsuarioRepository : IPosicionUsuarioRepository
    {
        private readonly string _connectionString;
        public PosicionUsuarioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void Add(PosicionUsuario posicion)
        {
            using var conn = new MySqlConnection(_connectionString);
            using (var cmd = new MySqlCommand(
            "INSERT INTO PosicionUsuario (id_usuario,id_actividad,latitud,longitud,fecha_hora,precision_gps,bateria_dispositivo) VALUES (@IdUsuario, @IdActividad,@Latitud, @Longitud, @FechaRegistro,@Precision,@Bateria)", conn))
            {
                cmd.Parameters.AddWithValue("@IdUsuario", posicion.IdUsuario);
                cmd.Parameters.AddWithValue("@IdActividad", posicion.IdActividad);
                cmd.Parameters.AddWithValue("@Latitud", posicion.Latitud);
                cmd.Parameters.AddWithValue("@Longitud", posicion.Longitud);
                cmd.Parameters.AddWithValue("@FechaRegistro", posicion.FechaHora);
                cmd.Parameters.AddWithValue("@Precision",posicion.PrecisionGPS);
                cmd.Parameters.AddWithValue("@Bateria",posicion.BateriaDispositivo);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public IEnumerable<PosicionUsuario> GetByUsuario(int idUsuario)
        {
            var list = new List<PosicionUsuario>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM PosicionUsuario WHERE " +
                                    "id_usuario = @id", conn);
            cmd.Parameters.AddWithValue("@id", idUsuario);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new PosicionUsuario
                {
                    IdPosicion = reader.GetInt32(reader.GetOrdinal("id_posicion")),
                    IdUsuario = reader.GetInt32(reader.GetOrdinal("id_usuario")),
                    IdActividad = reader.GetInt32(reader.GetOrdinal("id_actividad")),
                    Latitud = reader.GetDecimal(reader.GetOrdinal("latitud")),
                    Longitud = reader.GetDecimal(reader.GetOrdinal("longitud")),
                    FechaHora = reader.GetDateTime(reader.GetOrdinal("fecha_hora")),
                    PrecisionGPS = reader.GetDecimal(reader.GetOrdinal("precision_gps")),
                    BateriaDispositivo = reader.GetInt32(reader.GetOrdinal("bateria_dispositivo"))
                });
            }
            return list;
        }

        public PosicionUsuario GetUltimaPosicion(int idUsuario)
        {
            PosicionUsuario posicionEncontrada = new PosicionUsuario();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT TOP 1 * " +
                                        "FROM PosicionUsuario " +
                                        "WHERE id_usuario = @id " +
                                        "ORDER BY fecha_hora", conn);
            cmd.Parameters.AddWithValue("@id",idUsuario);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                posicionEncontrada.IdPosicion = reader.GetInt32(reader.GetOrdinal("id_posicion"));
                posicionEncontrada.IdUsuario = reader.GetInt32(reader.GetOrdinal("id_usuario"));
                posicionEncontrada.IdActividad = reader.GetInt32(reader.GetOrdinal("id_actividad"));
                posicionEncontrada.Latitud = reader.GetDecimal(reader.GetOrdinal("latitud"));
                posicionEncontrada.Longitud = reader.GetDecimal(reader.GetOrdinal("longitud"));
                posicionEncontrada.FechaHora = reader.GetDateTime(reader.GetOrdinal("fecha_hora"));
                posicionEncontrada.PrecisionGPS = reader.GetDecimal(reader.GetOrdinal("precision_gps"));
                posicionEncontrada.BateriaDispositivo = reader.GetInt32(reader.GetOrdinal("bateria_dispositivo"));
            }
            return posicionEncontrada;

        }
    }
}
