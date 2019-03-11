FROM mongo:latest

# Add mongo user
RUN groupadd -r mongo &&\
  useradd -r -g mongo mongo

USER mongo

CMD mongod --dbpath=/var/lib/mongodb
