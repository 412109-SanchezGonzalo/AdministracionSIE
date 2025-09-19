using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using MySql.Data.MySqlClient;

namespace AppAdminSIE_BE.Data.Repositories
{
    public class EdificioXUsuarioRepository : IEdificioXUsuario
    {
        private readonly string _connectionString;
        public EdificioXUsuarioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public IEnumerable<EdificioXUsuario> GetEdificioByUser(string contrasena)
        {
            var list = new List<EdificioXUsuario>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT uxe.id_usuarioxedificio ,uxe.id_usuario ,uxe.id_edificio" +
                                            " ,e.nombre  FROM UsuarioXEdificio uxe JOIN Edificio e " +
                                            "ON uxe.id_edificio  = e.id_edificio JOIN Usuario u " +
                                            "ON uxe.id_usuario  = u.id_usuario " +
                                            "WHERE u.Contrasena = @contrasena", conn);
            cmd.Parameters.AddWithValue("@contrasena",contrasena);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new EdificioXUsuario
                {
                    IdEdificioXUsuario = reader.GetInt32(reader.GetOrdinal("id_usuarioxedificio")),
                    IdUsuario = reader.GetInt32(reader.GetOrdinal("id_usuario")),
                    IdEdificio = reader.GetInt32(reader.GetOrdinal("id_edificio")),
                    NombreEdificio = reader.GetString(reader.GetOrdinal("nombre"))
                });
            }
            return list;
        }

    }
}
