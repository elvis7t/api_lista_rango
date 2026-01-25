DOCKER_COMPOSE := docker compose

up:
	@echo "$(GREEN)Starting Docker services...$(NC)"
	$(DOCKER_COMPOSE) up -d

force:
	@echo "$(GREEN)Forcing recreation of Docker services...$(NC)"
	$(DOCKER_COMPOSE) up -d --build --force-recreate