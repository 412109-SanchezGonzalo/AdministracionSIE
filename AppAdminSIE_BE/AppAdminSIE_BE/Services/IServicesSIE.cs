using JobOclock_BackEnd.Models;
using AppAdminSIE_BE.Data.Interfaces;
using AppAdminSIE_BE.Models;

namespace JobOclock_BackEnd.Services
{
    public interface IServicesSIE
    {
        // ACTIVIDAD
        IEnumerable<Servicio> GetAll();
        void AddActividad(string tipo);

        // EDIFICIO
        IEnumerable<Edificio> GetAllEdificios();

        // EDIFICIO X USUARIO

        IEnumerable<EdificioXUsuario> GetEdificioByUser(string contrasena);

        // PRODUCTO

        IEnumerable<Producto> GetAllProductos();
        Producto GetProductoByName(string name);

        // PEDIDO
        IEnumerable<Pedido> GetAllPedidos();
        int AddPedido(DateTime fechaEntrega);
        void UpdateEstado(int idPedido, string nuevoEstado);

        // PEDIDO X PRODUCTO

        IEnumerable<PedidoXProducto> GetAllPedidoXProductos();
        IEnumerable<PedidoXProducto> GetAllPedidoXProductosPorFecha(DateTime fecha);
        IEnumerable<PedidoXProducto> GetAllPedidoXProductosPorEstado(string estado);

        void AddPedidoXProducto(PedidoXProducto pedidoxproducto);

        void UpdateObservacionesPedidoXProducto(int idPedido, string? observacionesExtras);
        void UpdateEstadoProductoPedidoXProducto(int idPedido, int idProducto, string nuevoEstadoProducto);

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

        // USUARIO X Servicio
        IEnumerable<UsuarioXServicio> GetByUsuarioXActividad(int idUsuario);
        IEnumerable<UsuarioXServicio> GetByFecha(DateTime fecha);
        IEnumerable<UsuarioXServicio> GetByEstado(string estado);
        int AddUsuarioXActividad(UsuarioXServicio registro);
        void UpdateUsuarioXActividad(int idServicioXUsuario, int idServicio,int idEdificio,DateTime fecha , string? observaciones);
        void UpdateObservaciones(string observaciones, int idServicioXUsuario);
        void ChangeStatus(int idServicioXUsuario, string nuevoEstado);
        void DeleteServicioXUsuario(int idServicioXUsuario);

    }

    
}
