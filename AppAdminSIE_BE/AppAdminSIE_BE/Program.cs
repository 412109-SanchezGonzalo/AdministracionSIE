using JobOclock_BackEnd.Data.Interfaces;
using JobOclock_BackEnd.Data.Repositories;
using JobOclock_BackEnd.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configura el servidor Kestrel para que escuche en el puerto de Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");

// 1️⃣ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2️⃣ Inyección de dependencias para repositorios
var connStr = builder.Configuration.GetConnectionString("JobOclockSIE");

builder.Services.AddScoped<IActividadRepository>(_ => new ActividadRepository(connStr));
builder.Services.AddScoped<IFotoRegistroRepository>(_ => new FotoRegistroRepository(connStr));
builder.Services.AddScoped<IPosicionUsuarioRepository>(_ => new PosicionUsuarioRepository(connStr));
builder.Services.AddScoped<IRegistroRepository>(_ => new RegistroRepository(connStr));
builder.Services.AddScoped<IUsuarioRepository>(_ => new UsuarioRepository(connStr));
builder.Services.AddScoped<IUsuarioXActividadRepository>(_ => new UsuarioXActividadRepository(connStr));

// 3️⃣ Autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// 4️⃣ Servicio unificado
builder.Services.AddScoped<IServicesSIE, ServicesSIE>();

// 5️⃣ MVC + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🚀 Habilitar explorar directorios (opcional)
builder.Services.AddDirectoryBrowser();

var app = builder.Build();

// 6️⃣ Pipeline
// Mueve el middleware de Swagger fuera del bloque IsDevelopment
app.UseSwagger();
app.UseSwaggerUI();

// Solo usa la redirección HTTPS en el entorno de desarrollo local
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// 🌐 Servir archivos estáticos desde wwwroot
app.UseDefaultFiles();    // sirve automáticamente index.html si está en wwwroot
app.UseStaticFiles();    // habilita wwwroot

// 👉 Fallback: si no encuentra ruta, devuelve el index.html de Pages
app.MapFallbackToFile("Pages/Login_page.html");

// Mapear controladores (API)
app.MapControllers();

app.Run();
