using AppAdminSIE_BE.Models;
using JobOclock_BackEnd.Data.Repositories;
using JobOclock_BackEnd.Models;
using JobOclock_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace JobOclock_BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SIEController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IServicesSIE _service;

        public SIEController(IConfiguration configuration, IServicesSIE services)
        {
            _configuration = configuration;
            _service = services;
        }

        // ACTIVIDAD
        [HttpGet("Obtener-todas-las-actividades")]
        public ActionResult<IEnumerable<string>> GetAllActividades()
        {
            try
            {
                return Ok(_service.GetAll());
            }
            catch (Exception ex) { return BadRequest("Sin Actividades"); }
        }

        [HttpPost("Crear-actividad")]
        public ActionResult Post([FromQuery] string tipo)
        {
            try
            {
                _service.AddActividad(tipo);
                return Ok("Actividad Creada !");
            }
            catch (Exception ex) { return BadRequest("Ocurrio un error al crear una actividad: " + ex.Message); }
        }


        // EDIFICIO

         [HttpGet("Obtener-todos-los-edificios")]
         public ActionResult<IEnumerable<string>> GetAllEdificios()
         {
             try
             {
                 return Ok(_service.GetAllEdificios());
             }
             catch (Exception ex) { return BadRequest("Sin Edificios"); }
         }


        // PRODUCTO

        [HttpGet("Obtener-todos-los-productos")]
        public ActionResult GetAllProductos()
        {
            try
            {
                var productos = _service.GetAllProductos();
                if (productos != null)
                {
                    return Ok(productos);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }


        [HttpPost("Obtener-producto-por-nombre")]
        public ActionResult GetProductoByName([FromBody] string name)
        {
            try
            {
                var producto = _service.GetProductoByName(name);
                if (producto != null)
                {
                    return Ok(producto);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        // PEDIDO

        [HttpGet("Obtener-todos-los-pedidos")]
        public ActionResult<List<Pedido>> GetAllPedidos()
        {
            try
            {
                var list = _service.GetAllPedidos();
                if (list != null)
                {
                    return Ok(list);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }


        [HttpPost("Crear-pedido")]
        public ActionResult<int> AddPedidos([FromBody] DateTime fechaPedido)
        {
            try
            {
                return Ok(_service.AddPedido(fechaPedido));
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("Editar-estado-pedido")]
        public ActionResult UpdateEstadoPedido([FromBody] int idPedido)
        {
            try
            {
                _service.UpdateEstado(idPedido);
                return Ok("Estado Actualizado !");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        // PEDIDO X PRODUCTO
        [HttpGet("Obtener-todos-los-pedidoxproducto")]
        public ActionResult<List<PedidoXProducto>> GetPedidos()
        {
            try
            {
                var lista = _service.GetAllPedidoXProductos();
                if (lista != null)
                {
                    return Ok(lista);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Crear-pedidoxproducto")]
        public ActionResult CrearPedidoXProducto([FromBody] PedidoXProducto pedidoXProducto) 
        {
            try
            {
                _service.AddPedidoXProducto(pedidoXProducto);
                return Ok("PedidoXProducto Creado !");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }



        // USUARIO

        [HttpGet("Obtener-todos-los-usuarios")]

        public ActionResult<IEnumerable<string>> GetAllUsuario()
        {
            try
            {
                return Ok(_service.GetAllUsuarios());
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Obtener-usuario-por-nombre")]
        public ActionResult<Usuario> GetUsuarioByName([FromBody] string name)
        {
            try
            {
                return Ok(_service.GetByName(name));
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }


        [HttpPost("Obtener-nombre-de-usuario-por-contrasena")]
        public ActionResult<string> GetUserNameByPassword([FromBody] string password)
        {
            try
            {
                string name = _service.GetUsuarioByPassword(password);
                if (name != null)
                {
                    return Ok(name);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Obtener-usuario-por-contrasena")]
        public ActionResult<string> GetUserByPassword([FromBody] string password)
        {
            try
            {
                var user =  _service.GetByData(password);
                if (user != null)
                {
                    return Ok(user);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Obtener-usuario-por-nickname")]
        public ActionResult<string> GetUserByNickName([FromBody] string nick)
        {
            try
            {
                var user = _service.GetUsuarioByNickName(nick);
                if (user != null)
                {
                    return Ok(user);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Obtener-id-usuario-por-contrasena")]
        public ActionResult<string> GetUserIdByPassword([FromBody] string password)
        {
            try
            {
                var user = _service.GetUserIdByPassword(password);
                if (user > 0)
                {
                    return Ok(user);
                }
                return NotFound();
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Obtener-usuario-por-credenciales")]

        public ActionResult<string> PostUsuarioByCredenciales([FromBody] CredencialesRequest request)
        {
            try
            {
                var usuario = _service.GetUsuarioByCredenciales(request.nickName, request.contrasena);
                if (usuario != null)
                {
                    var issuer = _configuration["Jwt:Issuer"];
                    var audience = _configuration["Jwt:Audience"];
                    var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new[]
                        {
                            new Claim("Id", Guid.NewGuid().ToString()),
                            new Claim(JwtRegisteredClaimNames.Sub, usuario.NicknameDni),
                            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                            new Claim(ClaimTypes.Role, usuario.Rol) // Añade el rol del usuario aquí
                        }),
                        Expires = DateTime.UtcNow.AddMinutes(5), // El token expira en 5 minutos
                        Issuer = issuer,
                        Audience = audience,
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
                    };

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var jwtToken = tokenHandler.WriteToken(token);

                    // 3. Devolver el token al cliente
                    return Ok(new { token = jwtToken });
                }
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Crear-usuario")]

        public ActionResult CreateUser([FromQuery] Usuario usuario)
        {
            try
            {
                _service.AddUsuario(usuario);
                return Ok("Usuario Creado !");
            }
            catch (Exception ex) { return BadRequest("Erro al crear usuario: " + ex.Message); }
        }

        [HttpPut("Editar-usuario")]

        public ActionResult UpdateUser([FromQuery] Usuario user)
        {
            try
            {
                _service.UpdateUsuario(user);
                return Ok("Usuario Editado !");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("Editar-estado-usuario")]
        public ActionResult UpdateStatusUser([FromBody] ChangeStatus newStatus)
        {
            try
            {
                _service.UpdateStatus(newStatus.Id,newStatus.Status);
                return Ok("Estado de Usuario Editado !");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("Eliminar-usuario")]

        public ActionResult DeleteUser([FromQuery] int id)
        {
            try
            {
                _service.DeleteUsuario(id);
                return Ok("Usuario Eliminado !");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        // USUARIO X SERVICIO

        [HttpGet("Obtener-servicioXusuario-por-usuario")]
        public ActionResult<string> GetActividadXUsuario([FromQuery] int userId)
        {
            try
            {
                return Ok(_service.GetByUsuarioXActividad(userId));
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("Crear-servicioXactividad-por-usuario")]
        public ActionResult CreatActivityByUser([FromBody] UsuarioXServicio userXactivity)
        {
            try
            {
                
            
                int newID = _service.AddUsuarioXActividad(userXactivity);
        
                // Actualizar el objeto con el ID generado
                userXactivity.IdUsuarioXActividad = newID;
                
                // Retornar solo el objeto actualizado
                return Ok(userXactivity);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("Editar-servicioxusuario")]
        public ActionResult UpdateServicioXUsuario([FromBody] UpdateServicioxusuario servixusu)
        {
            try
            {
                _service.UpdateUsuarioXActividad(servixusu.IdServicioXActividad, servixusu.IdServicio, servixusu.IdEdificio, servixusu.Fecha, servixusu.Observaciones);
                return Ok("Tarea Editada con exito !");
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpDelete("Eliminar-servicioxusuario")]
        public ActionResult DeleteServicioXUsuario([FromBody] int idUsuario)
        {
            try
            {
                _service.DeleteServicioXUsuario(idUsuario);

                // Devolver un objeto JSON en lugar de string plano
                return Ok(new
                {
                    success = true,
                    message = "Tarea Eliminada con exito!"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
