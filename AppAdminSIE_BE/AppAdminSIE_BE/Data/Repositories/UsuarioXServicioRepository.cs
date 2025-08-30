using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class UsuarioXServicioRepository : IUsuarioXServicioRepository
    {
        private readonly string _connectionString;
        public UsuarioXServicioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public long Add(UsuarioXServicio registro)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "INSERT INTO ServicioXUsuario (id_usuario, id_servicio, id_edificio, observaciones, fecha) " +
                "VALUES (@idUsuario, @idServicio, @idEdificio, @observaciones, @fecha); " +
                "SELECT LAST_INSERT_ID();", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", registro.IdUsuario);
                cmd.Parameters.AddWithValue("@idServicio", registro.IdServicio);
                cmd.Parameters.AddWithValue("@idEdificio", registro.IdEdificio);
                cmd.Parameters.AddWithValue("@observaciones", registro.Observaciones);
                cmd.Parameters.AddWithValue("@fecha", registro.Fecha);

                conn.Open();
                // Usamos ExecuteScalar() para obtener el ID
                long id = (long)cmd.ExecuteScalar();
                return id;
            }
        }

        public IEnumerable<UsuarioXServicio> GetByUsuario(int idUsuario)
        {
            var actividades = new List<UsuarioXServicio>();
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(@"
                                    SELECT 
                                        uax.id_usuario,
                                        s.id_servicio,
                                        s.descripcion as Servicio,
                                        uax.observaciones as Observaciones,
                                        e.id_edificio,
                                        e.nombre as Edificio,
                                        CONCAT(e.calle, ' ', e.numeracion) as Direccion,
                                        uax.fecha as Fecha_de_Inicio 
                                    FROM ServicioXUsuario uax 
                                    JOIN Servicio s ON s.id_servicio = uax.id_servicio 
                                    JOIN Edificio e ON e.id_edificio = uax.id_edificio 
                                    WHERE uax.id_usuario = @idUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    var ordIdUsuario = reader.GetOrdinal("id_usuario");
                    var ordIdServicio = reader.GetOrdinal("id_servicio");
                    var ordNameServicio = reader.GetOrdinal("Servicio");
                    var ordIdEdificio = reader.GetOrdinal("id_edificio");
                    var ordNameEdificio = reader.GetOrdinal("Edificio");
                    var ordObservaciones = reader.GetOrdinal("Observaciones");
                    var ordFecha = reader.GetOrdinal("Fecha_de_Inicio");

                    while (reader.Read())
                    {
                        actividades.Add(new UsuarioXServicio
                        {
                            IdUsuario = reader.GetInt32(ordIdUsuario),
                            IdServicio = reader.GetInt32(ordIdServicio),
                            NombreServicio = reader.GetString(ordNameServicio),
                            IdEdificio = reader.GetInt32(ordIdEdificio),
                            NombreEdificio = reader.GetString(ordNameEdificio),
                            Observaciones = reader.IsDBNull(ordObservaciones) ? null : reader.GetString(ordObservaciones),
                            Fecha = reader.GetDateTime(ordFecha)
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
