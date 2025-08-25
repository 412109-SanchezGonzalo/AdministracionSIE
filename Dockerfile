# Usa la imagen base de .NET 8.0 SDK para construir
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copia los archivos del proyecto
COPY *.csproj ./
RUN dotnet restore

# Copia todo y construye la aplicación
COPY . ./
RUN dotnet publish -c Release -o out

# Usa la imagen base de .NET 8.0 runtime para ejecutar
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expone el puerto 10000 (requerido por Render)
EXPOSE 10000

# Comando para iniciar la aplicación
ENTRYPOINT ["dotnet", "AdministracionSIE.dll"]
