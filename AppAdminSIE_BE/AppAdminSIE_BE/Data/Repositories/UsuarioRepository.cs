using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly string _connectionString;
        public UsuarioRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void Add(Usuario usuario)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand(
                "INSERT INTO Usuario (Nickname_dni, Contrasena, telefono, email, nombre, apellido, Rol) " +
                "VALUES (@nick, @pass, @telefono, @email, @nombre, @apellido, @rol)", conn);

            cmd.Parameters.AddWithValue("@nick", usuario.NicknameDni);
            cmd.Parameters.AddWithValue("@pass", usuario.Contraseña);
            cmd.Parameters.AddWithValue("@rol", (object)usuario.Rol ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@telefono", usuario.Telefono);
            cmd.Parameters.AddWithValue("@email", usuario.Email);
            cmd.Parameters.AddWithValue("@nombre", usuario.Nombre);
            cmd.Parameters.AddWithValue("@apellido", usuario.Apellido);

            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public void Delete(int id)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("DELETE FROM Usuario WHERE id_usuario = @id", conn);
            cmd.Parameters.AddWithValue("@id", id);
            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public IEnumerable<Usuario> GetAll()
        {
            var list = new List<Usuario>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT id_usuario,CONCAT(apellido, ' ', nombre) as 'FullName',Nickname_dni FROM Usuario WHERE Rol = 'Usuario'", conn);
            conn.Open();
            using var reader = cmd.ExecuteReader();

            int idxIdUsuario = reader.GetOrdinal("id_usuario");
            int idxNickname = reader.GetOrdinal("Nickname_dni");
            int idxFullName = reader.GetOrdinal("FullName");

            while (reader.Read())
            {
                list.Add(new Usuario
                {
                    IdUsuario = reader.GetInt32(idxIdUsuario),
                    NicknameDni = reader.GetString(idxNickname),
                    Nombre = reader.GetString(idxFullName)
                });
            }
            return list;
        }

        public Usuario GetByCredenciales(string Nickname, string contrasena)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Usuario WHERE Nickname_dni = @nick AND Contrasena = @contrasena", conn);
            cmd.Parameters.AddWithValue("@nick", Nickname);
            cmd.Parameters.AddWithValue("@contrasena", contrasena);
            conn.Open();

            using var reader = cmd.ExecuteReader();

            int idxIdUsuario = reader.GetOrdinal("id_usuario");
            int idxNickname = reader.GetOrdinal("Nickname_dni");
            int idxContrasena = reader.GetOrdinal("Contrasena");
            int idxTipo = reader.GetOrdinal("tipo");
            int idxTelefono = reader.GetOrdinal("telefono");
            int idxEmail = reader.GetOrdinal("email");
            int idxNombre = reader.GetOrdinal("nombre");
            int idxApellido = reader.GetOrdinal("apellido");

            if (reader.Read())
            {
                return new Usuario
                {
                    IdUsuario = reader.GetInt32(idxIdUsuario),
                    NicknameDni = reader.GetString(idxNickname),
                    Contraseña = reader.GetString(idxContrasena),
                    Rol = reader.IsDBNull(idxTipo) ? null : reader.GetString(idxTipo),
                    Telefono = reader.GetString(idxTelefono),
                    Email = reader.GetString(idxEmail),
                    Nombre = reader.GetString(idxNombre),
                    Apellido = reader.GetString(idxApellido)
                };
            }
            return null;
        }

        public string GetNameByPassword(string password)
        {
            string name = null;
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT nombre FROM Usuario WHERE Contrasena = @contrasena", conn);
            cmd.Parameters.AddWithValue("@contrasena", password);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            int idxNombre = reader.GetOrdinal("nombre");

            if (reader.Read())
            {
                name = reader.GetString(idxNombre);
            }
            return name;
        }

        public string GetFullNameByNickName(string nickName)
        {
            string name = null;
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT CONCAT(nombre, ' ', apellido) as 'FullName' FROM Usuario WHERE Nickname_dni = @nickName", conn);
            cmd.Parameters.AddWithValue("@nickName", nickName);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            int idxNombre = reader.GetOrdinal("FullName");

            if (reader.Read())
            {
                name = reader.GetString(idxNombre);
            }
            return name;
        }
        public int GetUserIdByPassword(string contrasena)
        {
            int id = 0;
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT id_usuario FROM Usuario WHERE Contrasena = @contrasena", conn);
            cmd.Parameters.AddWithValue("@contrasena", contrasena);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            int idxId = reader.GetOrdinal("id_usuario");

            if (reader.Read())
            {
                id = reader.GetInt32(idxId);
            }
            return id;
        }

        public Usuario GetByData(string contrasena)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM Usuario WHERE Contrasena = @contrasena", conn);
            cmd.Parameters.AddWithValue("@contrasena", contrasena);
            conn.Open();

            using var reader = cmd.ExecuteReader();

            int idxIdUsuario = reader.GetOrdinal("id_usuario");
            int idxNickname = reader.GetOrdinal("Nickname_dni");
            int idxContrasena = reader.GetOrdinal("Contrasena");
            int idxRol = reader.GetOrdinal("Rol");
            int idxTelefono = reader.GetOrdinal("telefono");
            int idxEmail = reader.GetOrdinal("email");
            int idxNombre = reader.GetOrdinal("nombre");
            int idxApellido = reader.GetOrdinal("apellido");

            if (reader.Read())
            {
                return new Usuario
                {
                    IdUsuario = reader.GetInt32(idxIdUsuario),
                    NicknameDni = reader.GetString(idxNickname),
                    Contraseña = reader.GetString(idxContrasena),
                    Rol = reader.IsDBNull(idxRol) ? null : reader.GetString(idxRol),
                    Telefono = reader.GetString(idxTelefono),
                    Email = reader.GetString(idxEmail),
                    Nombre = reader.GetString(idxNombre),
                    Apellido = reader.GetString(idxApellido)
                };
            }
            return null;
        }

        public Usuario GetByName(string name)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT id_usuario,CONCAT(apellido, ' ', nombre) as 'FullName',Nickname_dni FROM Usuario WHERE nombre = @name", conn);
            cmd.Parameters.AddWithValue("@name", name);
            conn.Open();

            using var reader = cmd.ExecuteReader();

            int idxIdUsuario = reader.GetOrdinal("id_usuario");
            int idxNickname = reader.GetOrdinal("Nickname_dni");
            int idxFullName = reader.GetOrdinal("FullName");

            if (reader.Read())
            {
                return new Usuario
                {
                    IdUsuario = reader.GetInt32(idxIdUsuario),
                    NicknameDni = reader.GetString(idxNickname),
                    Nombre = reader.GetString(idxFullName)
                };
            }
            return null;
        }

        public void Update(Usuario usuario)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand(
                "UPDATE Usuario SET Nickname_dni = @nick, Contrasena = @pass, telefono = @telefono, " +
                "email = @email, nombre = @nombre, apellido = @apellido, Rol = @Rol " +
                "WHERE id_usuario = @id", conn);

            cmd.Parameters.AddWithValue("@nick", usuario.NicknameDni);
            cmd.Parameters.AddWithValue("@pass", usuario.Contraseña);
            cmd.Parameters.AddWithValue("@Rol", (object)usuario.Rol ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@telefono", usuario.Telefono);
            cmd.Parameters.AddWithValue("@email", usuario.Email);
            cmd.Parameters.AddWithValue("@nombre", usuario.Nombre);
            cmd.Parameters.AddWithValue("@apellido", usuario.Apellido);
            cmd.Parameters.AddWithValue("@id", usuario.IdUsuario);

            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public void UpdateStatus(int idUsuario, string status)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand(
                "UPDATE Usuario SET Estado = @status WHERE id_usuario = @id", conn);

            cmd.Parameters.AddWithValue("@status", status);
            cmd.Parameters.AddWithValue("@id", idUsuario);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
