using JobOclock_BackEnd.Models;
using JobClock_BackEnd.Data.Interfaces;

namespace JobOclock_BackEnd.Services
{
    public interface IServicesSIE
    {
        // ACTIVIDAD
        IEnumerable<Actividad> GetAll();
        void AddActividad(string tipo);

        // EDIFICIO
        IEnumerable<Edificio> GetAllEdificios();

        // FOTO REGISTRO 
        IEnumerable<FotoRegistro> GetFotoRegistroByRegistro(int idRegistro);
        void AddFotoRegistro(FotoRegistro foto);

        // POSICION USUARIO
        IEnumerable<PosicionUsuario> GetPosicionByUsuario(int intUsuario);
        PosicionUsuario GetUltimaPosicion(int idUsuario);
        void Add(PosicionUsuario posicion);

        // REGISTRO 
        IEnumerable<Registro> GetRegistroByUsuario(int idUsuario);
        Registro GetRegistroById(int id);
        void AddRegistro(Registro registro);
        void UpdateRegistroSalida(int idRegistro, string horaSalida);

        // USUARIO
        IEnumerable<Usuario> GetAllUsuarios();
        string GetUsuarioByPassword(string password);
        string GetUsuarioByNickName(string nick);
        int GetUserIdByPassword(string contrasena);
        Usuario GetUsuarioByCredenciales(string nick,string contrasena);
        Usuario GetByData(string contrasena);
        Usuario GetByName(string name);
        void AddUsuario(Usuario usuario);
        void UpdateUsuario(Usuario usuario);
        void UpdateStatus(int id, string status);
        void DeleteUsuario(int id);

        // USUARIO X ACTIVIDAD
        IEnumerable<UsuarioXActividad> GetByUsuarioXActividad(int idUsuario);
        void AddUsuarioXActividad(UsuarioXActividad registro);
        void UpdateEstadoUsuarioXActividad(int idUsuario, int idActividad, string nuevoEstado);

    }

    
}
