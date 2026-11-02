FROM php:8.2-apache

# Instalar la extensión para conectar con MySQL
RUN docker-php-ext-install pdo_mysql

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite

# Configurar Apache para utilizar el puerto 10000 de Render
RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Copiar el proyecto al servidor
COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 10000
