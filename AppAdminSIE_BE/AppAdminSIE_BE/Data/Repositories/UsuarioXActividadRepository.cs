using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class UsuarioXActividadRepository : IUsuarioXActividadRepository
    {
        private readonly string _connectionString;
        public UsuarioXActividadRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void Add(UsuarioXActividad registro)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "INSERT INTO UsuarioXActividad (id_actividad, id_usuario, Pago_actividad, ubicacion_tarea, estado_actividad) " +
                "VALUES (@idActividad, @idUsuario, @pago, @ubicacion, @estado)", conn))
            {
                cmd.Parameters.AddWithValue("@idActividad", registro.IdActividad);
                cmd.Parameters.AddWithValue("@idUsuario", registro.IdUsuario);
                cmd.Parameters.AddWithValue("@pago", (object)registro.PagoActividad ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@ubicacion", (object)registro.UbicacionTarea ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@estado", (object)registro.Estado ?? DBNull.Value);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public IEnumerable<UsuarioXActividad> GetByUsuario(int idUsuario)
        {
            var actividades = new List<UsuarioXActividad>();

            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand("SELECT * FROM UsuarioXActividad WHERE id_usuario = @idUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
                conn.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    var ordIdActividad = reader.GetOrdinal("id_actividad");
                    var ordIdUsuario = reader.GetOrdinal("id_usuario");
                    var ordPago = reader.GetOrdinal("Pago_actividad");
                    var ordUbicacion = reader.GetOrdinal("ubicacion_tarea");
                    var ordEstado = reader.GetOrdinal("estado_actividad");

                    while (reader.Read())
                    {
                        actividades.Add(new UsuarioXActividad
                        {
                            IdActividad = reader.GetInt32(ordIdActividad),
                            IdUsuario = reader.GetInt32(ordIdUsuario),
                            PagoActividad = reader.GetDecimal(ordPago),
                            UbicacionTarea = reader.IsDBNull(ordUbicacion) ? null : reader.GetString(ordUbicacion),
                            Estado = reader.IsDBNull(ordEstado) ? null : reader.GetString(ordEstado)
                        });
                    }
                }
            }
            return actividades;
        }

        public void UpdateEstado(int idUsuario, int idActividad, string nuevoEstado)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "UPDATE UsuarioXActividad SET estado_actividad = @estado WHERE id_usuario = @idUsuario AND id_actividad = @idActividad", conn))
            {
                cmd.Parameters.AddWithValue("@estado", nuevoEstado);
                cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
                cmd.Parameters.AddWithValue("@idActividad", idActividad);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
