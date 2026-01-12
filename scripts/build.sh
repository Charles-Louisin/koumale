#!/bin/bash
# Script de build pour Vercel - Force l'utilisation de Webpack
export NEXT_PRIVATE_SKIP_TURBO=1
next build
