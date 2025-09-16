using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using Mysqlx.Cursor;
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
        public int Add(UsuarioXServicio registro)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "INSERT INTO ServicioXUsuario (id_usuario, id_servicio, id_edificio, observaciones, fecha, fechaFinalizacion , estado) " +
                "VALUES (@idUsuario, @idServicio, @idEdificio, @observaciones, @fecha,@fechaFinalizacion,@estado); " +
                "SELECT LAST_INSERT_ID();", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", registro.IdUsuario);
                cmd.Parameters.AddWithValue("@idServicio", registro.IdServicio);
                cmd.Parameters.AddWithValue("@idEdificio", registro.IdEdificio);
                cmd.Parameters.AddWithValue("@observaciones", registro.Observaciones);
                cmd.Parameters.AddWithValue("@fecha", registro.Fecha);
                cmd.Parameters.AddWithValue("@fechaFinalizacion",registro.FechaFinalizacion);
                cmd.Parameters.AddWithValue("@estado",registro.Estado);
                
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

        public IEnumerable<UsuarioXServicio> GetByUsuario(int idUsuario)
        {
            var actividades = new List<UsuarioXServicio>();
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(@"
                                    SELECT 
                                        uax.id_servicioxactividad,
                                        uax.id_usuario,
                                        s.id_servicio,
                                        s.descripcion as Servicio,
                                        uax.observaciones as Observaciones,
                                        e.id_edificio,
                                        e.nombre as Edificio,
                                        CONCAT(e.calle, ' ', e.numeracion) as Direccion,
                                        uax.fecha as Fecha_de_Inicio,
                                        uax.fechaFinalizacion as Fecha_de_Finalizacion,
                                        uax.estado as Estado
                                    FROM ServicioXUsuario uax 
                                    JOIN Servicio s ON s.id_servicio = uax.id_servicio 
                                    JOIN Edificio e ON e.id_edificio = uax.id_edificio 
                                    WHERE uax.id_usuario = @idUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    var ordIdUsuarioXActividad = reader.GetOrdinal("id_servicioxactividad");
                    var ordIdUsuario = reader.GetOrdinal("id_usuario");
                    var ordIdServicio = reader.GetOrdinal("id_servicio");
                    var ordNameServicio = reader.GetOrdinal("Servicio");
                    var ordIdEdificio = reader.GetOrdinal("id_edificio");
                    var ordNameEdificio = reader.GetOrdinal("Edificio");
                    var ordObservaciones = reader.GetOrdinal("Observaciones");
                    var ordFecha = reader.GetOrdinal("Fecha_de_Inicio");
                    var ordFechaFinalizacion = reader.GetOrdinal("Fecha_de_Finalizacion");
                    var ordEstado = reader.GetOrdinal("Estado");

                    while (reader.Read())
                    {
                        actividades.Add(new UsuarioXServicio
                        {
                            IdUsuarioXActividad = reader.GetInt32(ordIdUsuarioXActividad),
                            IdUsuario = reader.GetInt32(ordIdUsuario),
                            IdServicio = reader.GetInt32(ordIdServicio),
                            NombreServicio = reader.GetString(ordNameServicio),
                            IdEdificio = reader.GetInt32(ordIdEdificio),
                            NombreEdificio = reader.GetString(ordNameEdificio),
                            Observaciones = reader.IsDBNull(ordObservaciones) ? null : reader.GetString(ordObservaciones),
                            Fecha = reader.GetDateTime(ordFecha),
                            FechaFinalizacion = reader.IsDBNull(ordFechaFinalizacion) ? null : reader.GetDateTime(ordFechaFinalizacion),
                            Estado = reader.GetString(ordEstado)
                        });
                    }
                }
            }
            return actividades;
        }

        public void Update(int idServicioXUsuario, int idServicio,int idEdificio, DateTime fecha, string? observaciones)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "UPDATE ServicioXUsuario SET id_servicio = @idServicio, id_edificio= @idEdificio, " +
                "fecha = @fecha, observaciones = @observaciones " +
                "WHERE id_servicioxactividad = @idServicioXUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idServicio", idServicio);
                cmd.Parameters.AddWithValue("@idEdificio", idEdificio);
                cmd.Parameters.AddWithValue("@fecha",fecha);
                cmd.Parameters.AddWithValue("@observaciones",observaciones);
                cmd.Parameters.AddWithValue("@idServicioXUsuario", idServicioXUsuario);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public void UpdateObservaciones(string observaciones, int idServicioXUsuario)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "UPDATE ServicioXUsuario SET observaciones = @observaciones " +
                "WHERE id_servicioxactividad = @idServicioXUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@observaciones", observaciones);
                cmd.Parameters.AddWithValue("@idServicioXUsuario", idServicioXUsuario);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public void Delete(int idServicioXUsuario)
        {
            using (var conn = new MySqlConnection(_connectionString))
            using (var cmd = new MySqlCommand(
                "DELETE FROM ServicioXUsuario " +
                "WHERE id_servicioxactividad = @idServicioXUsuario", conn))
            {
                cmd.Parameters.AddWithValue("@idServicioXUsuario", idServicioXUsuario);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
