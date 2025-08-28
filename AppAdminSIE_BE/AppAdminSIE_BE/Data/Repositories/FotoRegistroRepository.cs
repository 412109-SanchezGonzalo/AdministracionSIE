using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace JobOclock_BackEnd.Data.Repositories
{
    public class FotoRegistroRepository : IFotoRegistroRepository
    {
        private readonly string _connectionString;
        public FotoRegistroRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void Add(FotoRegistro foto)
        {
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("INSERT INTO FotoRegistro" +
                            "(id_registro,url_foto,tipo_foto,fecha_hora) " +
                            "VALUES(@idRegistro,@urlFoto,@tipoFoto,@fechaHora)", conn);
            cmd.Parameters.AddWithValue("@idRegistro",foto.IdRegistro);
            cmd.Parameters.AddWithValue("@urlFoto",foto.UrlFoto);
            cmd.Parameters.AddWithValue("@tipoFoto",foto.TipoFoto);
            cmd.Parameters.AddWithValue("@fechaHora",foto.FechaHora);
            conn.Open();
            cmd.ExecuteNonQuery();

        }

        public IEnumerable<FotoRegistro> GetByRegistro(int idRegistro)
        {
            var list = new List<FotoRegistro>();
            using var conn = new MySqlConnection(_connectionString);
            using var cmd = new MySqlCommand("SELECT * FROM FotoRegistro WHERE " +
                                        "id_registro = @id", conn);
            cmd.Parameters.AddWithValue("@id",idRegistro);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new FotoRegistro
                {
                    IdFoto = reader.GetInt32(reader.GetOrdinal("id_foto")),
                    IdRegistro = reader.GetInt32(reader.GetOrdinal("id_registro")),
                    UrlFoto = reader.GetString(reader.GetOrdinal("url_foto")),
                    TipoFoto = reader.GetString(reader.GetOrdinal("tipo_foto")),
                    FechaHora = reader.GetDateTime(reader.GetOrdinal("fecha_hora"))
                });
            }
            return list;
        }
    }
}
