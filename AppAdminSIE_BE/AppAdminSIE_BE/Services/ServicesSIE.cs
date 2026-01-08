using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Services
{
    public class ServicesSIE : IServicesSIE
    {
        private readonly IServicioRepository _actividadRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IUsuarioXServicioRepository _usuarioXActividadRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IEdificioRepository _edificioRepository;
        private readonly IEdificioXUsuario _edificioXUsuarioRepository;
        private readonly IPedidoRepository _pedidoRepository;
        private readonly IPedidoXProductoRepository _pedidoXProductoRepository;
        public ServicesSIE(IServicioRepository actividadRepository,  IUsuarioRepository ussuarioRepository, IUsuarioXServicioRepository usuarioXActividadRepository,IProductoRepository productoRepository,IEdificioRepository edificioRepository,IEdificioXUsuario edificioXUsuario,IPedidoRepository pedidoRepository, IPedidoXProductoRepository pedidoXProductoRepository)
        {
            _actividadRepository = actividadRepository;
            _usuarioRepository = ussuarioRepository;
            _usuarioXActividadRepository = usuarioXActividadRepository;
            _productoRepository = productoRepository;
            _edificioRepository = edificioRepository;
            _edificioXUsuarioRepository = edificioXUsuario;
            _pedidoRepository = pedidoRepository;
            _pedidoXProductoRepository = pedidoXProductoRepository;
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
        public void AddEdificio(Edificio edificio)
        {
            _edificioRepository.Add(edificio);
        }


        // EDIFICIO X USUARIO

        public IEnumerable<EdificioXUsuario> GetEdificioByUser(string contrasena)
        {
            return _edificioXUsuarioRepository.GetEdificioByUser(contrasena);
        }


        // PRODUCTO

        public void AddProducto(Producto producto)
        {
            _productoRepository.Add(producto);
        }

        public IEnumerable<Producto> GetAllProductos()
        {
            return _productoRepository.GetAllProducto();
        }

        public Producto GetProductoByName(string name)
        {
            return _productoRepository.GetByName(name);
        }


        // PEDIDO
        public IEnumerable<Pedido> GetAllPedidos()
        {
            return _pedidoRepository.GetAllPedidos();
        }
        public int AddPedido(DateTime fechaEntrega)
        {
            return _pedidoRepository.AddPedido(fechaEntrega);
        }
        public void UpdateEstado(int idPedido, string nuevoEstado)
        {
            _pedidoRepository.UpdateEstado(idPedido, nuevoEstado);
        }

        // PEDIDO X PRODUCTO

        public IEnumerable<PedidoXProducto> GetAllPedidoXProductos()
        {
            return _pedidoXProductoRepository.GetAllPedidoXProductos();
        }
        public IEnumerable<PedidoXProducto> GetAllPedidoXProductosPorFecha(DateTime fecha)
        {
            return _pedidoXProductoRepository.GetAllPedidoXProductosPorFecha(fecha);
        }
        public IEnumerable<PedidoXProducto> GetAllPedidoXProductosPorEstado(string estado)
        {
            return _pedidoXProductoRepository.GetAllPedidoXProductosPorEstado(estado);
        }
        public void AddPedidoXProducto(PedidoXProducto pedidoxproducto)
        {
            _pedidoXProductoRepository.AddPedidoXProducto(pedidoxproducto);
        }

        public void UpdateObservacionesPedidoXProducto(int idPedido, string? observacionesExtras)
        {
            _pedidoXProductoRepository.UpdateObservacionesPedidoXProducto(idPedido, observacionesExtras);
        }

        public void UpdateEstadoProductoPedidoXProducto(int idPedido, int idProducto, string nuevoEstadoProducto)
        {
            _pedidoXProductoRepository.UpdateEstadoProductoPedidoXProducto(idPedido, idProducto, nuevoEstadoProducto);
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
        public IEnumerable<UsuarioXServicio> GetByFecha(DateTime fecha)
        {
            return _usuarioXActividadRepository.GetByFecha(fecha);
        }
        public IEnumerable<UsuarioXServicio> GetByEstado(string estado)
        {
            return _usuarioXActividadRepository.GetByEstado(estado);
        }
        public int AddUsuarioXActividad(UsuarioXServicio registro)
        {
            return _usuarioXActividadRepository.Add(registro);
        }
        public void UpdateUsuarioXActividad(int idServicioXUsuario, int idServicio,int idEdificio,DateTime fecha, string? observaciones)
        {
            _usuarioXActividadRepository.Update(idServicioXUsuario,idServicio,idEdificio,fecha,observaciones);
        }

        public void UpdateObservaciones(string observaciones, int idServicioXUsuario)
        {
            _usuarioXActividadRepository.UpdateObservaciones(observaciones, idServicioXUsuario);
        }
        public void ChangeStatus(int idServicioXUsuario, string nuevoEstado)
        {
            _usuarioXActividadRepository.ChangeStatus(idServicioXUsuario, nuevoEstado);
        }
        public void DeleteServicioXUsuario(int idServicioXUsuario)
        {
            _usuarioXActividadRepository.Delete(idServicioXUsuario);
        }
    }
}
