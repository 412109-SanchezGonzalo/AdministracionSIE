namespace AppAdminSIE_BE.Models
{
    public class UpdatePedidoxproducto
    {
        public int IdPedido { get; set; }
        public int IdProducto { get; set; }
        public string? ObservacionesExtras { get; set; }
        public string nuevoEstadoProducto { get; set; }
    }
}
