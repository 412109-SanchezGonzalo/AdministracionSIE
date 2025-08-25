# Usa la imagen base de .NET 8.0 SDK para construir
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copia los archivos del proyecto desde las carpetas correctas
COPY AppAdminSIE_BE/*.csproj ./AppAdminSIE_BE/
COPY AppAdminSIE_FE/*.csproj ./AppAdminSIE_FE/

# Restaura las dependencias
WORKDIR /app/AppAdminSIE_BE
RUN dotnet restore

# Copia todo el código fuente
WORKDIR /app
COPY . ./

# Construye la aplicación del backend
WORKDIR /app/AppAdminSIE_BE
RUN dotnet publish -c Release -o out

# Usa la imagen base de .NET 8.0 runtime para ejecutar
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/AppAdminSIE_BE/out .

# Expone el puerto 10000 (requerido por Render)
EXPOSE 10000

# Comando para iniciar la aplicación (ajusta el nombre del dll si es diferente)
ENTRYPOINT ["dotnet", "AppAdminSIE_BE.dll"]
