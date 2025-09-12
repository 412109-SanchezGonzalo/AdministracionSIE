using JobOclock_BackEnd.Models;
using JobOclock_BackEnd.Data.Interfaces;
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

        // PRODUCTO

        IEnumerable<Producto> GetAllProductos();
        Producto GetProductoByName(string name);

        // PEDIDO
        IEnumerable<Pedido> GetAllPedidos();
        int AddPedido(DateTime fechaEntrega);
        void UpdateEstado(int idPedido);

        // PEDIDO X PRODUCTO

        IEnumerable<PedidoXProducto> GetAllPedidoXProductos();

        void AddPedidoXProducto(PedidoXProducto pedidoxproducto);

        void UpdatePedidoXProducto(int idPedido, string? observacionesExtras);

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
        int AddUsuarioXActividad(UsuarioXServicio registro);
        void UpdateUsuarioXActividad(int idServicioXUsuario, int idServicio,int idEdificio,DateTime fecha , string? observaciones);
        void DeleteServicioXUsuario(int idServicioXUsuario);

    }

    
}
