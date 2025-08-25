FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AppAdminSIE_BE/AppAdminSIE_BE.csproj", "AppAdminSIE_BE/"]
RUN dotnet restore "AppAdminSIE_BE/AppAdminSIE_BE.csproj"
COPY . .
WORKDIR "/src/AppAdminSIE_BE"
RUN dotnet build "AppAdminSIE_BE.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AppAdminSIE_BE.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AppAdminSIE_BE.dll"]