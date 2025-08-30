using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Services
{
    public class ServicesSIE : IServicesSIE
    {
        private readonly IServicioRepository _actividadRepository;
        private readonly IFotoRegistroRepository _fotoRegistroRepository;
        private readonly IPosicionUsuarioRepository _posicionUsuarioRepository;
        private readonly IRegistroRepository _registroRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IUsuarioXServicioRepository _usuarioXActividadRepository;
        private readonly IEdificioRepository _edificioRepository;
        public ServicesSIE(IServicioRepository actividadRepository, IFotoRegistroRepository fotoRegistroRepository, IPosicionUsuarioRepository posicionUsuarioRepository, IRegistroRepository registroRepository, IUsuarioRepository ussuarioRepository, IUsuarioXServicioRepository usuarioXActividadRepository,IEdificioRepository edificioRepository)
        {
            _actividadRepository = actividadRepository;
            _fotoRegistroRepository = fotoRegistroRepository;
            _posicionUsuarioRepository = posicionUsuarioRepository;
            _registroRepository = registroRepository;
            _usuarioRepository = ussuarioRepository;
            _usuarioXActividadRepository = usuarioXActividadRepository;
            _edificioRepository = edificioRepository;
        }
        
        // ACTIVIDAD
        public IEnumerable<Servicio> GetAll()
        {
            return _actividadRepository.GetAll();
        }
        public void AddActividad(string tipo)
        {
            _actividadRepository.Add(tipo);
        }
        
        
        // EDIFICIO
        public IEnumerable<Edificio> GetAllEdificios()
        {
            return _edificioRepository.GetAllEdificios();
        }

        // FOTO REGISTRO
        public IEnumerable<FotoRegistro> GetFotoRegistroByRegistro(int idRegistro)
        {
            return _fotoRegistroRepository.GetByRegistro(idRegistro);
        }
        public void AddFotoRegistro(FotoRegistro foto)
        {
            _fotoRegistroRepository.Add(foto);
        }

        // POSICION 
        public IEnumerable<PosicionUsuario> GetPosicionByUsuario(int intUsuario)
        {
            return _posicionUsuarioRepository.GetByUsuario(intUsuario);
        }
        public PosicionUsuario GetUltimaPosicion(int idUsuario)
        {
            return _posicionUsuarioRepository.GetUltimaPosicion(idUsuario);
        }
        public void Add(PosicionUsuario posicion)
        {
            _posicionUsuarioRepository.Add(posicion);
        }

        // REGISTRO
        public IEnumerable<Registro> GetRegistroByUsuario(int idUsuario)
        {
            return _registroRepository.GetByUsuario(idUsuario);
        }
        public Registro GetRegistroById(int id)
        {
            return _registroRepository.GetById(id);
        }
        public void AddRegistro(Registro registro)
        {
            _registroRepository.Add(registro);
        }
        public void UpdateRegistroSalida(int idRegistro, string horaSalida) { 
            _registroRepository.UpdateSalida(idRegistro,horaSalida);
        }

        // USUARIO
        public IEnumerable<Usuario> GetAllUsuarios()
        {
            return _usuarioRepository.GetAll();
        }
        public string GetUsuarioByPassword(string password)
        {
            return _usuarioRepository.GetNameByPassword(password);
        }
        public string GetUsuarioByNickName(string nick)
        {
            return _usuarioRepository.GetFullNameByNickName(nick);
        }
        public int GetUserIdByPassword(string contrasena)
        {
            return _usuarioRepository.GetUserIdByPassword(contrasena);
        }
        public Usuario GetByData(string contrasena)
        {
            return _usuarioRepository.GetByData(contrasena);
        }
        public Usuario GetUsuarioByCredenciales(string nick, string contrasena)
        {
            return _usuarioRepository.GetByCredenciales(nick, contrasena);
        }
        public Usuario GetByName(string name)
        {
            return _usuarioRepository.GetByName(name);
        }
        public void AddUsuario(Usuario usuario)
        {
            _usuarioRepository.Add(usuario);
        }
        public void UpdateUsuario(Usuario usuario)
        {
            _usuarioRepository.Update(usuario);
        }

        public void UpdateStatus(int id, string status)
        {
            _usuarioRepository.UpdateStatus(id,status);
        }
        public void DeleteUsuario(int id)
        {
            _usuarioRepository.Delete(id);
        }

        // USUARIO X SERVICIO
        public IEnumerable<UsuarioXServicio> GetByUsuarioXActividad(int idUsuario)
        {
            return _usuarioXActividadRepository.GetByUsuario(idUsuario);
        }
        public int AddUsuarioXActividad(UsuarioXServicio registro)
        {
            return _usuarioXActividadRepository.Add(registro);
        }
        public void UpdateEstadoUsuarioXActividad(int idUsuario, int idActividad, string nuevoEstado)
        {
            _usuarioXActividadRepository.UpdateEstado(idUsuario,idActividad,nuevoEstado);
        }

    }
}
