const logger = require("./pino-logger");

/**
 *
 * @param {Object} objRef parameter of refrence object passing
 * @param {*} param1
 * @returns {Object}
 */

const permissionTrigger = ({ permissions, permissionIf, usecaseMethod }) => {
  // ignore permissions
  if (permissions === undefined) return {};

  if (!permissions.includes(permissionIf)) return {};

  return usecaseMethod();
};

/**
 *
 * @param {*} res
 * @param {*} param1
 * usecaseMethod true or false depending on permissions
 *
 */
const permissionGuard = async (res, { permissions, permission, usecaseMethod }) => {
  console.error("Guard Trigger :");
  logger.info("Permissions :", permissions);
  logger.info("Permissions guard :", permission);

  if (permissions === undefined) return false;

  perms = permissions.split(", "); // JSON.parse(permissions);

  /**if have not permission */
  if (!perms.includes(permission)) return false;

  if (!(await usecaseMethod())) {
    res.status(401).send({ message: "Unauthorized Access This Resource" });

    return true;
  }

  return false;
};

const intersection = (permissions, permission) => {
  const intersec = permissions.filter((e) => permission.includes(e));
  return intersec.length;
};

const permissionProtectIf = async (res, { permissions, permission = [] }) => {
  console.error("Guard Trigger :");
  logger.info("Permissions :", permissions);
  logger.info("Permissions guard:", permission);

  if (permissions === undefined) return false;

  perms = permissions.split(", "); //JSON.parse(permissions);

  /**if have not permission but when exclude true the permission must not have to running usecase method */
  if (permission?.length > 1) {
    if (!intersection(perms, permission)) {
      res.status(401).send({ message: "Unauthorized Access This Resource" });
      return true;
    }
  } else if (!perms.includes(permission[0])) {
    res.status(401).send({ message: "Unauthorized Access This Resource" });
    return true;
  }

  return false;
};

module.exports = { permissionTrigger, permissionGuard, permissionProtectIf };
