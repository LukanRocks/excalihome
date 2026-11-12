#!/bin/sh
set -e

# Data dirs bind-mounted from earlier versions (which ran as root) are owned by root.
# Hand anything not yet owned by `node` over to it, then drop privileges.
# When the container is started with --user, run as that user unchanged.
if [ "$(id -u)" = "0" ]; then
  find "$DATA_DIR" ! -user node -exec chown node:node {} +
  exec su-exec node "$@"
fi

exec "$@"
