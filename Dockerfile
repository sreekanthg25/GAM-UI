# Use below nginx version
FROM nginx:1.21.6-alpine
# Copy the dist folder of the react app
COPY ./dist /var/www
# Copy the ngnix configrations
COPY deployments/nginx.conf /etc/nginx/nginx.conf
# Expose it on port 80
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]