import { Router } from "express";
import GenreController from "../controller/GenreController.js";

const router = Router();

/**
 * @openapi
 * /genres:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Listar todos os gêneros
 *     description: Retorna todos os gêneros cadastrados, ordenados por nome.
 *     responses:
 *       200:
 *         description: Lista de gêneros retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 *       500:
 *         description: Erro interno ao buscar gêneros.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", GenreController.getAll);

/**
 * @openapi
 * /genres/search:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Buscar gêneros por palavra-chave
 *     description: Retorna os gêneros cujo nome ou descrição contenham a palavra-chave.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Palavra-chave utilizada na pesquisa
 *         schema:
 *           type: string
 *           example: ação
 *     responses:
 *       200:
 *         description: Gêneros encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Palavra-chave não informada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao pesquisar gêneros.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", GenreController.search);

/**
 * @openapi
 * /genres/{id}:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Buscar gênero por ID
 *     description: Retorna um gênero específico pelo seu identificador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do gênero.
 *     responses:
 *       200:
 *         description: Gênero encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       404:
 *         description: Gênero não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar gênero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", GenreController.getById);

/**
 * @openapi
 * /genres/{id}/movies:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Listar os filmes de um gênero
 *     description: Retorna os filmes cadastrados no gênero informado, ordenados por título.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do gênero.
 *     responses:
 *       200:
 *         description: Filmes do gênero retornados com sucesso.
 *       404:
 *         description: Gênero não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar filmes do gênero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/movies", GenreController.getMovies);

/**
 * @openapi
 * /genres:
 *   post:
 *     tags:
 *       - Genres
 *     summary: Criar um gênero
 *     description: Cadastra um novo gênero. O nome é obrigatório e não pode se repetir.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGenre'
 *     responses:
 *       201:
 *         description: Gênero criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao criar gênero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", GenreController.create);

/**
 * @openapi
 * /genres/{id}:
 *   put:
 *     tags:
 *       - Genres
 *     summary: Atualizar um gênero
 *     description: Atualiza os dados de um gênero existente. Apenas os campos informados são alterados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do gênero.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGenre'
 *     responses:
 *       200:
 *         description: Gênero atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Gênero não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao atualizar gênero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", GenreController.update);

/**
 * @openapi
 * /genres/{id}:
 *   delete:
 *     tags:
 *       - Genres
 *     summary: Remover um gênero
 *     description: Remove um gênero pelo seu identificador. Não é possível remover um gênero que possui filmes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do gênero.
 *     responses:
 *       200:
 *         description: Gênero removido com sucesso.
 *       400:
 *         description: Gênero possui filmes e não pode ser removido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Gênero não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao remover gênero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", GenreController.remove);

export default router;
