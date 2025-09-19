using JobOclock_BackEnd.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IUsuarioRepository
    {
        IEnumerable<Usuario> GetAll();
        string GetNameByPassword(string password);
        string GetFullNameByNickName(string nick);
        Usuario GetByCredenciales(string Nickname, string contrasena);
        Usuario GetByData(string contrasena);
        Usuario GetByName(string name);
        int GetUserIdByPassword(string contrasena);
        void Add(Usuario usuario);
        void Update(Usuario usuario);
        void UpdateStatus(int id,string status);
        void Delete(int id);
    }
}
